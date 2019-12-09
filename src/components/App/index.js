import React, { useState, useEffect } from "react";
import { useCookies } from 'react-cookie';
import { connect } from "react-redux";
import * as actions from "../../actions/settings";
import * as marketActions from "../../actions/market";
import { updateStopLossList } from '../../actions/stopLoss'
import { updateTickOffsetList } from "../../actions/tickOffset";
import { updateStopEntryList } from "../../actions/stopEntry";
import Spinner from "./Spinner";
import Siderbar from "../Sidebar";
import HomeView from "../HomeView/";
import LadderView from "../LadderView/";
import GridView from "../GridView/";
import SocketContext from "../../SocketContext";
import Title from "./Title";
import getQueryVariable from "../../utils/Market/GetQueryVariable";
import { AddRunner } from "../../utils/ladder/AddRunner";
import { UpdateRunner } from "../../utils/ladder/UpdateRunner";
import { isPremiumActive } from "../../utils/DateCalculator";
import PremiumPopup from "../PremiumPopup";
import { updateLayList } from "../../actions/lay";
import { updateBackList } from "../../actions/back";
import { checkTimeListAfter } from "../../utils/TradingStategy/BackLay";
import { placeOrder, updateOrders } from "../../actions/order";
import { updateFillOrKillList } from "../../actions/fillOrKill";
import { checkStopLossForMatch, checkTickOffsetForMatch } from "../../utils/ExchangeStreaming/OCMHelper";
import Draggable from "../Draggable";
import { stopLossTrailingChange, stopLossCheck, stopEntryListChange } from "../../utils/ExchangeStreaming/MCMHelper";
import { calcHedgedPL2 } from "../../utils/TradingStategy/HedingCalculator";
import { sortLadder, sortGreyHoundMarket } from "../../utils/ladder/SortLadder";

const App = props => {
  const [marketId, setMarketId] = useState(null);
  const [cookies] = useCookies(['sessionKey', 'username']);

  if (!cookies.sessionKey && !cookies.username) {
    window.location.href = window.location.origin;
  }
  const loadSession = async () => {
    await fetch(
      `/api/load-session?sessionKey=${encodeURIComponent(
        cookies.sessionKey
      )}&email=${encodeURIComponent(cookies.username)}`
    );
  };

  const loadSettings = async () => {
    /**
     * Fetch settings from the database and load them into redux state
     * @return {Object} settings
     *   User settings.
     */
    await fetch(`/api/get-user-settings`)
      .then(res => res.json())
      .then(settings => {
        props.onToggleDefaultView(settings.defaultView);
        props.onToggleActiveView(settings.defaultView);
        props.onToggleSounds(settings.sounds);
        props.onToggleTools(settings.tools);
        props.onToggleUnmatchedBets(settings.unmatchedBets);
        props.onToggleMatchedBets(settings.matchedBets);
        props.onToggleGraph(settings.graphs);
        props.onToggleMarketInformation(settings.marketInfo);
        props.onUpdateWinMarketsOnly(settings.winMarketsOnly);
        props.onToggleRules(settings.rules);
        props.onToggleLadderUnmatched(settings.ladderUnmatched);
        props.onReceiveStakeBtns(settings.stakeBtns);
        props.onReceiveLayBtns(settings.layBtns);
        props.onReceiveRightClickTicks(settings.rightClickTicks);
        props.onReceiveHorseRaces(settings.horseRaces);
      });

    /**
     * @return {Boolean} premiumStatus
     *   Premium membership status required to access the LadderView.
     */
    await fetch(`/api/premium-status`)
      .then(res => res.json())
      .then(expiryDate => {
        let now = new Date();
        const isActive = isPremiumActive(now, expiryDate);
        props.setPremiumStatus(isActive);
      });
  };

  const cleanupOnMarketClose = (marketId) => {
    window.open(`${window.location.origin}/getClosedMarketStats?marketId=${marketId}`);
  }

  const loadMarket = async () => {
    let marketId = getQueryVariable("marketId");

    // Check if the page has query parameter 'marketId'
    // Load the market if found
    if (marketId !== false) {
      await fetch(`/api/get-market-info?marketId=${marketId}`)
        .then(res => res.json())
        .then(async data => {
          if (data.error) {
            window.location.href = window.location.origin + "/logout";
          } else {
            setMarketId(marketId);
            if (data.result.length > 0) {
              const runners = {};
              for (let i = 0; i < data.result[0].runners.length; i++) {
                let selectionId = data.result[0].runners[i].selectionId;
                runners[selectionId] = data.result[0].runners[i];

                if (runners[selectionId].metadata.CLOTH_NUMBER) {
                  runners[selectionId].runnerName = runners[selectionId].runnerName.replace(/[0-9.]*[.,\s]/g, ' ').trim();
                }

                // The Stake/Liability buttons for the GridView
                runners[selectionId].order = {
                  visible: false,
                  backLay: 0,
                  stakeLiability: 0,
                  stake: 2,
                  price: 0
                };
              }
              props.onSortLadder(sortGreyHoundMarket(data.result[0].eventType.id, runners));
              props.onReceiveEventType(data.result[0].eventType.id);
              props.onUpdateRunners(runners);
              props.onReceiveMarket(data.result[0]);
              props.onSelectRunner(data.result[0].runners[0]);
              const selectionNames = {};

              Object.keys(runners).forEach(selectionId => {
                selectionNames[selectionId] = runners[selectionId].runnerName;
              });

              fetch('/api/save-runner-names', {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                  marketId: marketId,
                  selectionNames: selectionNames
                })
              });

              // Subscribe to Market Change Messages (MCM) via the Exchange Streaming API
              props.socket.emit("market-subscription", {
                marketId: data.result[0].marketId
              });

              let loadedBackOrders = {};
              let loadedLayOrders = {};
              let loadedStopEntryOrders = {};
              let loadedTickOffsetOrders = {};
              let loadedFillOrKillOrders = {};
              let loadedStopLossOrders = {};
              let loadedUnmatchedOrders = {};
              let loadedMatchedOrders = {};


              await fetch(`/api/get-all-orders`)
                .then(res => res.json())
                .then(async orders => {
                  const loadOrders = async orders => {
                    const currentOrders = await fetch(`/api/listCurrentOrders?marketId=${marketId}`).then(res => res.json()).then(res => res.currentOrders);
                    const currentOrdersObject = {};
                    currentOrders.forEach(item => {
                      currentOrdersObject[item.betId] = item;
                      if (item.status === "EXECUTION_COMPLETE") {
                        currentOrdersObject[item.betId].price = item.averagePriceMatched;
                      } else {
                        currentOrdersObject[item.betId].price = item.priceSize.price;
                      }
                    });

                    orders.map(async order => {

                      if (order.marketId === marketId) {
                        switch (order.strategy) {
                          case "Back":
                            loadedBackOrders[order.selectionId] = loadedBackOrders[order.selectionId] === undefined ? [order] : loadedBackOrders[order.selectionId].concat(order);
                            break;
                          case "Lay":
                            loadedLayOrders[order.selectionId] = loadedLayOrders[order.selectionId] === undefined ? [order] : loadedLayOrders[order.selectionId].concat(order);
                            break;
                          case "Stop Entry":
                            loadedStopEntryOrders[order.selectionId] = loadedStopEntryOrders[order.selectionId] === undefined ? [order] : loadedStopEntryOrders[order.selectionId].concat(order);
                            break;
                          case "Tick Offset":
                            loadedTickOffsetOrders[order.rfs] = order;
                            break;
                          case "Fill Or Kill":
                            // this should only keep the fill or kill if the order isn't completed already
                            if (currentOrdersObject[order.betId] === "EXECUTABLE") {
                              loadedFillOrKillOrders[order.betId] = order;
                            }
                            break;
                          case "Stop Loss":
                            loadedStopLossOrders[order.selectionId] = order;
                            break;
                          default:
                            break;
                        }
                      }
                    });

                    // handle orders not in the there
                    Object.keys(currentOrdersObject).map(async betId => {
                      const order = currentOrdersObject[betId];
                      const orderData = {
                        strategy: "None",
                        marketId: order.marketId,
                        side: order.side,
                        price: order.price,
                        size: order.status === "EXECUTION_COMPLETE" ? order.sizeMatched : order.priceSize.size,
                        selectionId: order.selectionId,
                        rfs: order.customerStrategyRef ? order.customerStrategyRef : "None",
                        betId: betId
                      }

                      if (order.status === "EXECUTION_COMPLETE") {
                        loadedMatchedOrders[order.betId] = orderData;
                      } else if (order.status === "EXECUTABLE") {
                        loadedUnmatchedOrders[order.betId] = orderData;
                      }
                    });
                  }
                  await loadOrders(orders);
                }).then(() => {
                  props.onChangeOrders({
                    matched: loadedMatchedOrders,
                    unmatched: loadedUnmatchedOrders
                  });
                  props.onChangeBackList(loadedBackOrders);
                  props.onChangeLayList(loadedLayOrders);
                  props.onChangeStopEntryList(loadedStopEntryOrders);
                  props.onChangeTickOffsetList(loadedTickOffsetOrders);
                  props.onChangeFillOrKillList(loadedFillOrKillOrders);
                  props.onChangeStopLossList(loadedStopLossOrders);
                });
            }
          }
        });
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await loadSession();
      await loadSettings();
      await loadMarket();
      props.setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (Object.keys(props.unmatchedBets).length > 0) {
      props.socket.emit("order-subscription", {
        customerStrategyRefs: JSON.stringify(Object.values(props.unmatchedBets).map(bet => bet.rfs))
      });
    }
  }, [Object.keys(props.unmatchedBets).length]);

  useEffect(() => {
    setInterval(async () => {
      if (marketId) {
        const currentOrders = await fetch(`/api/listCurrentOrders?marketId=${marketId}`).then(res => res.json()).then(res => res.currentOrders);
        const currentOrdersObject = {};
        currentOrders.forEach(item => {
          currentOrdersObject[item.betId] = item;
          if (item.status === "EXECUTION_COMPLETE") {
            currentOrdersObject[item.betId].price = item.averagePriceMatched;
          } else {
            currentOrdersObject[item.betId] = item;
            currentOrdersObject[item.betId].price = item.priceSize.price;
          }
        });
  
        const loadedUnmatchedOrders = {};
        const loadedMatchedOrders = {};
  
        Object.keys(currentOrdersObject).map(async betId => {
          const order = currentOrdersObject[betId];
  
          const orderData = {
            strategy: "None",
            marketId: order.marketId,
            side: order.side,
            price: order.price,
            size: order.status === "EXECUTION_COMPLETE" ? order.sizeMatched : order.priceSize.size,
            selectionId: order.selectionId,
            rfs: order.customerStrategyRef ? order.customerStrategyRef : "None",
            betId: betId
          }
  
          if (order.status === "EXECUTION_COMPLETE") {
            loadedMatchedOrders[order.betId] = orderData;
          } else if (order.status === "EXECUTABLE") {
            loadedUnmatchedOrders[order.betId] = orderData;
          }
        })
  
        props.onChangeOrders({
          matched: loadedMatchedOrders,
          unmatched: loadedUnmatchedOrders
        }); 
      }
    }, 15000);
  }, []);


  useEffect(() => {
    props.socket.on("market-definition", async marketDefinition => {
      props.onMarketStatusChange(marketDefinition.status);
      props.setInPlay(marketDefinition.inPlay);

      if (marketDefinition.status === "CLOSED" && !props.marketOpen) {
        props.socket.off("market-definition");
        props.onMarketClosed();
        cleanupOnMarketClose(getQueryVariable("marketId"));
      }
    });
  }, [props.marketStatus]);

  useEffect(() => {
    /**
     * Listen for Market Change Messages from the Exchange Streaming socket and create/update them
     * @param {obj} data The market change message data: { rc: [(atb, atl, batb, batl, tv, ltp, id)] }
     */
    props.socket.on("mcm", async data => {
      // Turn the socket off to prevent the listener from runner more than once. It will back on once the component reset.
      props.socket.off("mcm");

      const marketId = getQueryVariable("marketId");
      let eventTypeId = props.eventType;
      let marketStatus = props.marketStatus;

      var ladders = Object.assign({}, props.ladders);
      var nonRunners = Object.assign({}, props.nonRunners);

      // Update the market status
      if (data.marketDefinition) {
        marketStatus = data.marketDefinition.status;
        eventTypeId = data.marketDefinition.eventTypeId;

        props.onMarketStatusChange(marketStatus);
        props.setInPlay(data.marketDefinition.inPlay);

        if (!props.market.inPlayTime && data.marketDefinition.inPlay) {
          // Start the in-play clock
          props.setInPlayTime(new Date());
        }

        // data.marketDefinition.runners.forEach(runner => {
        //   if (runner.status === "REMOVED") {
        //     if (runner.id in ladders) {
        //       delete ladders[runner.id];
        //     }
        //     if (runner.id in nonRunners === false) {
        //       nonRunners[runner.id] = ladders[runner.id];
        //     }
        //   }
        // });
        // props.onReceiveNonRunners(nonRunners);
      }
      
      if (data.rc) {
        let adjustedStopLossList = Object.assign({}, props.stopLossList);
        const adjustedBackList = {};
        const adjustedLayList = {};
        let newStopEntryList = Object.assign({}, props.stopEntryList);

        let stopLossOrdersToRemove = [];

        await Promise.all(data.rc.map(async rc => {

          if (rc.id in props.ladders) {
            // Runner found so we update our object with the raw data
            // ladders[rc.id] = UpdateRunner(props.ladders[rc.id], rc);

            // Back and Lay
            if (props.marketDefinition && props.marketDefinition.marketStatus === "RUNNING") {
              const adjustedBackOrderArray = await checkTimeListAfter(props.backList[rc.id], rc.id, data.marketDefinition.openDate, props.onPlaceOrder, marketId, "BACK", props.matchedBets, props.unmatchedBets)
              if (adjustedBackOrderArray.length > 0) {
                adjustedBackList[rc.id] = adjustedBackOrderArray;
              }

              const adjustedLayOrderArray = await checkTimeListAfter(props.layList[rc.id], rc.id, data.marketDefinition.openDate, props.onPlaceOrder, marketId, "LAY", props.matchedBets, props.unmatchedBets)
              if (adjustedLayOrderArray.length > 0) {
                adjustedLayList[rc.id] = adjustedLayOrderArray;
              }
            }

            // stop Entry

            newStopEntryList = stopEntryListChange(props.stopEntryList, rc.id, rc.ltp, props.onPlaceOrder, newStopEntryList, props.unmatchedBets, props.matchedBets);
            // We increment and check the stoplosses
            if (props.stopLossList[rc.id] !== undefined) {
              // if it's trailing and the highest LTP went up, then we add a tickoffset
              const maxLTP = props.ladders[rc.id].ltp.sort((a, b) => b - a)[0];
              let adjustedStopLoss = Object.assign({}, stopLossTrailingChange(props.stopLossList, rc.id, rc.ltp, maxLTP));

              // if hedged, get size (price + hedged profit/loss)
              if (adjustedStopLoss.hedged) {
                const newMatchedBets = Object.values(props.bets.matched).filter(bet => bet.selectionId == adjustedStopLoss.selectionId);

                const combinedSize =
                  newMatchedBets.reduce((a, b) => {
                    return a + b.size;
                  }, 0);

                const profitArray = newMatchedBets.map(bet => (bet.side === "LAY" ? -1 : 1) * calcHedgedPL2(parseFloat(bet.size), parseFloat(bet.price), parseFloat(adjustedStopLoss.price)));
                const profit = (-1 * profitArray.reduce((a, b) => a + b, 0));
                adjustedStopLoss.size = combinedSize + profit;
              }

              // if it doesn't have a reference or the order has been matched (STOP LOSS)
              const stopLossMatched = stopLossCheck(adjustedStopLoss, rc.id, rc.ltp, props.onPlaceOrder, stopLossOrdersToRemove, adjustedStopLossList, props.unmatchedBets, props.matchedBets);
              adjustedStopLossList = stopLossMatched.adjustedStopLossList;
              stopLossOrdersToRemove = stopLossMatched.stopLossOrdersToRemove;
            }

          }
          else if (rc.id in nonRunners === false) {
            // Runner found so we create the new object with the raw data
            // ladders[rc.id] = AddRunner(rc);
            props.onReceiverLadders(AddRunner(rc));
          }
        }));

        if (stopLossOrdersToRemove.length > 0) {
          await fetch('/api/remove-orders', {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(stopLossOrdersToRemove)
          })
        }

        // so it doesn't mess up the loading of the orders
        if (Object.keys(props.backList).length > 0) {
          props.onChangeBackList(adjustedBackList);
        }
        if (Object.keys(props.layList).length > 0) {
          props.onChangeLayList(adjustedLayList);
        }
        if (Object.keys(props.stopEntryList).length > 0) {
          props.onChangeStopEntryList(newStopEntryList);
        }
        if (Object.keys(props.stopLossList).length > 0) {
          props.onChangeStopLossList(adjustedStopLossList);
        }

        // If it's not a Greyhound Race (4339), we sort by the LTP
        if (eventTypeId !== "4339") {
          var sortedLadderIndices = sortLadder(ladders);
          props.onSortLadder(sortedLadderIndices);
          props.onChangeExcludedLadders(sortedLadderIndices.slice(6, sortedLadderIndices.length));
        }
        // props.onReceiverLadders(ladders);
      }
    });

    /**
     * Listen for Order Change Messages from the Exchange Streaming socket and create/update them
     * @param {obj} data The order change message data:
     */
    props.socket.on("ocm", async data => {
      if (data.oc) {
        const newUnmatchedBets = Object.assign({}, props.unmatchedBets);
        const newMatchedBets = Object.assign({}, props.matchedBets);
        let checkForMatchInStopLoss = Object.assign({}, props.stopLossList);
        let checkForMatchInTickOffset = Object.assign({}, props.tickOffsetList);
        let tickOffsetOrdersToRemove = [];

        data.oc.forEach(changes => {
          changes.orc.forEach(runner => {
            if (runner.uo) {
              runner.uo.forEach(order => {
                // If the bet isn't in the unmatchedBets, we should delete it.
                if (newUnmatchedBets[order.id] !== undefined) {
                  delete newUnmatchedBets[order.id];
                } else if (order.sr == 0) { // this is what happens when an order is finished
                  newMatchedBets[order.id] = newUnmatchedBets[order.id];
                  delete newUnmatchedBets[order.id];
                }

                checkForMatchInStopLoss = checkStopLossForMatch(props.stopLossList, runner.id, order, checkForMatchInStopLoss);

                // Checks tick offset and then adds to tickOffsetOrdersToRemove if it passes the test, Gets new tickOffsetList without the Order
                const tickOffsetCheck = checkTickOffsetForMatch(props.tickOffsetList, order, props.onPlaceOrder, tickOffsetOrdersToRemove, checkForMatchInTickOffset, props.unmatchedBets, props.matchedBets);
                checkForMatchInTickOffset = tickOffsetCheck.checkForMatchInTickOffset;
                tickOffsetOrdersToRemove = tickOffsetCheck.tickOffsetOrdersToRemove;
              });
            }
          });
        });


        if (tickOffsetOrdersToRemove.length > 0) {
          await fetch('/api/remove-orders', {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(tickOffsetOrdersToRemove)
          })
        }

        if (Object.keys(props.stopLossList).length > 0) {
          props.onChangeStopLossList(checkForMatchInStopLoss);
        }

        if (Object.keys(props.tickOffsetList).length > 0) {
          props.onChangeTickOffsetList(checkForMatchInTickOffset);
        }

        if (Object.keys(props.unmatchedBets).length > 0) {
          props.onChangeOrders({
            unmatched: newUnmatchedBets,
            matched: newMatchedBets,
          });
        }
      }
      props.socket.off("ocm");
    });
  }, [props.ladders, props.marketStatus]);

  const renderView = () => {
    switch (props.view) {
      case "HomeView":
        return <HomeView />;
      case "LadderView":
        return <LadderView />;
      case "GridView":
        return <GridView />;
      default:
        return <HomeView />;
    }
  };

  if (props.isLoading) {
    return <Spinner/>;
  } else {
    return (
      <div className="horizontal-scroll-wrapper">
        <div className="root">
          <Title/>
          <Siderbar />
          <main className="content">
            <Draggable />
            {renderView()}
            <PremiumPopup />
          </main>
        </div>
      </div>
    );
  }
};

const AppWithSocket = props => (
  <SocketContext.Consumer>
    {socket => <App {...props} socket={socket} />}
  </SocketContext.Consumer>
);

const mapStateToProps = state => {
  return {
    view: state.settings.view,
    isLoading: state.settings.isLoading,
    market: state.market.currentMarket,
    eventType: state.market.eventType,
    marketOpen: state.market.marketOpen,
    marketStatus: state.market.status,
    ladders: state.market.ladder,
    sortedLadded: state.market.sortedLadder,
    nonRunners: state.market.nonRunners,
    premiumMember: state.settings.premiumMember,
    premiumPopup: state.settings.premiumPopupOpen,
    stopLossList: state.stopLoss.list,
    tickOffsetList: state.tickOffset.list,
    stopEntryList: state.stopEntry.list,
    fillOrKillList: state.fillOrKill.list,
    layList: state.lay.list,
    backList: state.back.list,
    unmatchedBets: state.order.bets.unmatched,
    matchedBets: state.order.bets.matched
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setLoading: isLoading => dispatch(actions.setIsLoading(isLoading)),
    onToggleDefaultView: view => dispatch(actions.setDefaultView(view)),
    onToggleActiveView: view => dispatch(actions.setActiveView(view)),
    onToggleSounds: isSelected => dispatch(actions.toggleSound(isSelected)),
    onToggleTools: settings => dispatch(actions.toggleTools(settings)),
    onToggleUnmatchedBets: settings =>
      dispatch(actions.toggleUnmatchedBets(settings)),
    onToggleMatchedBets: settings =>
      dispatch(actions.toggleMatchedBets(settings)),
    onToggleGraph: settings => dispatch(actions.toggleGraph(settings)),
    onToggleMarketInformation: settings =>
      dispatch(actions.toggleMarketInformation(settings)),
    onUpdateWinMarketsOnly: isChecked => dispatch(actions.setWinMarketsOnly(isChecked)),
    onToggleRules: settings => dispatch(actions.toggleRules(settings)),
    onToggleLadderUnmatched: unmatchedColumn => dispatch(actions.toggleLadderUnmatched(unmatchedColumn)),
    onReceiveStakeBtns: data => dispatch(actions.setStakeBtns(data)),
    onReceiveLayBtns: data => dispatch(actions.setLayBtns(data)),
    onReceiveRightClickTicks: ticks => dispatch(actions.updateRightClickTicks(ticks)),
    onReceiveHorseRaces: horseRaces => dispatch(actions.setHorseRacingCountries(horseRaces)),
    onReceiveMarket: market => dispatch(marketActions.loadMarket(market)),
    onMarketClosed: () => dispatch(marketActions.closeMarket()),
    onReceiveEventType: eventType => dispatch(marketActions.setEventType(eventType)),
    onSelectRunner: runner => dispatch(marketActions.setRunner(runner)),
    onUpdateRunners: runners => dispatch(marketActions.loadRunners(runners)),
    onReceiverLadders: ladders => dispatch(marketActions.loadLadder(ladders)),
    onSortLadder: sortedLadder => dispatch(marketActions.setSortedLadder(sortedLadder)),
    onReceiveNonRunners: nonRunners => dispatch(marketActions.loadNonRunners(nonRunners)),
    onChangeExcludedLadders: excludedLadders => dispatch(marketActions.updateExcludedLadders(excludedLadders)),
    onMarketStatusChange: isOpen => dispatch(marketActions.setMarketStatus(isOpen)),
    setInPlay: inPlay => dispatch(marketActions.setInPlay(inPlay)),
    setInPlayTime: time => dispatch(marketActions.setInPlayTime(time)),
    setPremiumStatus: isPremium => dispatch(actions.setPremiumStatus(isPremium)),
    onChangeStopLossList: list => dispatch(updateStopLossList(list)),
    onChangeTickOffsetList: list => dispatch(updateTickOffsetList(list)),
    onChangeStopEntryList: list => dispatch(updateStopEntryList(list)),
    onChangeLayList: list => dispatch(updateLayList(list)),
    onChangeBackList: list => dispatch(updateBackList(list)),
    onPlaceOrder: order => dispatch(placeOrder(order)),
    onChangeFillOrKillList: list => dispatch(updateFillOrKillList(list)),
    onChangeOrders: orders => dispatch(updateOrders(orders))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppWithSocket);