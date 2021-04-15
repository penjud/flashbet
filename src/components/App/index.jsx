import _ from 'lodash';
import crypto from 'crypto';
import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import useInterval from '../../utils/CustomHooks/useInterval';
//* Actions
import { setIsLoading, setPremiumStatus } from '../../actions/settings';
import {
  setMarketId,
  setMarketName,
  setMarketDescription,
  setMarketStartTime,
  setEvent,
  setEventType,
  closeMarket,
  loadLadder,
  setSortedLadder,
  setRunner,
  loadRunners,
  loadNonRunners,
  setMarketStatus,
  setInPlay,
  setInPlayTime,
  setMarketPL,
  updateLadderOrder,
  updateExcludedLadders,
} from '../../actions/market';
import { placeOrder, addUnmatchedBet, addMatchedBet, removeUnmatchedBet, updateSizeMatched, setBetExecutionComplete } from '../../actions/bet';
import { updateBackList } from '../../actions/back';
import { updateLayList } from '../../actions/lay';
import { updateStopLossList, setStopLossBetMatched, removeStopLoss } from '../../actions/stopLoss';
import { updateTickOffsetList, removeTickOffset } from '../../actions/tickOffset';
import { updateStopEntryList, removeMultiSelectionStopEntryBets } from '../../actions/stopEntry';
import { updateFillOrKillList } from '../../actions/fillOrKill';
import Spinner from './Spinner';
import Siderbar from '../Sidebar';
import HomeView from '../HomeView';
import Views from '../Views';
import SocketContext from '../../contexts/SocketContext';
import Title from './Title';
import PremiumPopup from '../PremiumPopup';
//* HTTP
import fetchData from '../../http/fetchData';
import { removeBet, updateTicks, updateOrderMatched, getAllBets } from '../../http/dbHelper';
import Draggable from '../Draggable';
//* Utils
import handleAuthError from '../../utils/Errors/handleAuthError';
import getQueryVariable from '../../utils/Market/GetQueryVariable';
import { CreateRunners } from '../../utils/Market/CreateRunners';
//* Utils > Ladder
import { sortLadder, sortGreyHoundMarket } from '../../utils/ladder/SortLadder';
import { UpdateLadder } from '../../utils/ladder/UpdateLadder';
import { CreateLadder } from '../../utils/ladder/CreateLadder';
//* Utils > Trading Tools
import { checkTickOffsetTrigger } from '../../utils/TradingStategy/TickOffset';
import { checkStopLossTrigger, checkStopLossHit } from '../../utils/TradingStategy/StopLoss';
import { checkStopEntryTargetMet, extractStopEntryRfs } from '../../utils/TradingStategy/StopEntry';
import CalculateLadderHedge from '../../utils/ladder/CalculateLadderHedge';
import ConnectionStatus from '../ConnectionStatus';
//* Constants
import { ONE_SECOND, TWO_HUNDRED_AND_FIFTY_MILLISECONDS } from '../../constants';

const App = ({
  view,
  isLoading,
  marketOpen,
  marketId,
  nonRunners,
  unmatchedBets,
  matchedBets,
  stopLossList,
  tickOffsetList,
  stopEntryList,
  socket,
  setIsLoading,
  setPremiumStatus,
  setMarketId,
  setMarketName,
  setMarketDescription,
  setMarketStartTime,
  eventType,
  setEvent,
  setEventType,
  closeMarket,
  loadLadder,
  sortedLadder,
  setSortedLadder,
  updateExcludedLadders,
  setRunner,
  loadRunners,
  loadNonRunners,
  setMarketStatus,
  inPlayTime,
  setInPlay,
  setInPlayTime,
  setMarketPL,
  setStopLossBetMatched,
  removeStopLoss,
  updateStopLossList,
  removeTickOffset,
  updateTickOffsetList,
  updateStopEntryList,
  removeMultiSelectionStopEntryBets,
  updateLayList,
  updateBackList,
  placeOrder,
  addUnmatchedBet,
  addMatchedBet,
  removeUnmatchedBet,
  updateSizeMatched,
  setBetExecutionComplete,
  updateFillOrKillList,
}) => {
  const [updates, setUpdates] = useState([]);
  const [isUpdated, setIsUpdated] = useState(true);
  const [initialClk, setInitialClk] = useState(null);
  const [clk, setClk] = useState(null);
  const [connectionId, setConnectionId] = useState('');
  const [connectionError, setConnectionError] = useState('');

  const getPremiumStatus = async () => {
    const result = await fetchData('http://localhost:3000/premium?user=traderjosh');
    if (result.error) {
      setPremiumStatus(false);
    } else {
      setPremiumStatus(result);
    }
  };

  const retrieveBets = async () => {
    if (!marketId) return;
    try {
      const { currentOrders } = await fetchData(`/api/listCurrentOrders?marketId=${marketId}`);
      for (let i = 0; i < currentOrders.length; i += 1) {
        const { marketId, selectionId, betId, side, status, sizeMatched, sizeRemaining, averagePriceMatched, priceSize, customerStrategyRef: rfs } = currentOrders[i];

        // Check if the bet isn't in matched/unmatched already and add it if not
        if (!unmatchedBets[betId] && !matchedBets[betId]) {
          const betParams = {
            strategy: 'None',
            marketId,
            side,
            size: priceSize.size,
            sizeMatched,
            sizeRemaining,
            selectionId,
            rfs: rfs || 'None',
            betId,
          }

          if (status === 'EXECUTABLE') {
            // Original price requested
            betParams.price = priceSize.price;
            addUnmatchedBet(betParams);
          } else if (status === 'EXECUTION_COMPLETE') {
            // Average price matched
            betParams.price = averagePriceMatched;
            addMatchedBet(betParams);
          }
        }

        // We only track the bets if the customerStrategyRef doesn't exist, otherwise OCM handles this
        else if (!rfs) {
          if (stopLossList[selectionId] && !stopLossList[selectionId].assignedIsOrderMatched && sizeRemaining === 0) {
            setStopLossBetMatched({ selectionId });
            updateOrderMatched({ rfs, assignedIsOrderMatched: true });
          }

          if (tickOffsetList[rfs]) {
            const tosTriggered = checkTickOffsetTrigger(tickOffsetList[rfs], sizeMatched);
            if (tosTriggered) {
              removeTickOffset({ selectionId });
              removeBet({ rfs });
              placeOrder({
                marketId,
                selectionId,
                side: tickOffsetList[rfs].side,
                size: tickOffsetList[rfs].size,
                price: tickOffsetList[rfs].price,
                customerStrategyRef: crypto.randomBytes(15).toString('hex').substring(0, 15),
              });
            }
          }

          // Move from unmatched to matched
          if (status === 'EXECUTION_COMPLETE' && !matchedBets[betId]) {
            setBetExecutionComplete({ betId, sizeMatched, sizeRemaining });
          } else if (status === 'EXECUTABLE') {
            if (!unmatchedBets[betId]) {
              // Add it to unmatched
              addUnmatchedBet({
                strategy: 'None',
                marketId,
                side,
                price: priceSize.price,
                size: priceSize.size,
                sizeMatched,
                sizeRemaining,
                selectionId,
                rfs: rfs || 'None',
                betId,
              });
            } else if (unmatchedBets[betId].sizeMatched != sizeMatched || unmatchedBets.sizeRemaining != sizeRemaining) {
              // update the prices
              updateSizeMatched({ betId, sizeMatched, sizeRemaining });
            }
          }
        }
      }
    } catch (e) {
      // console.log(e);
    }
  };

  const onReceiveMarketDefinition = useCallback(
    async (marketDefinition) => {
      setMarketStatus(marketDefinition.status);
      setInPlay(marketDefinition.inPlay);

      if (!inPlayTime && marketDefinition.inPlay) {
        // Start the in-play clock once we get the 'in play' signal
        setInPlayTime(new Date());
      }

      if (marketDefinition.status === 'CLOSED') {
        window.open(`${window.location.origin}/getClosedMarketStats?marketId=${marketId}`);
        if (marketOpen) {
          closeMarket();
        }
      }
    },
    [setMarketStatus, setInPlay, inPlayTime, marketOpen, setInPlayTime, closeMarket, marketId],
  );

  /**
   * Listen for Market Change Messages from the Exchange Streaming socket and create/update them
   * @param {obj} data The market change message data: { rc: [(atb, atl, tv, ltp, id)] }
   */
  const onReceiveMarketMessage = useCallback(
    (data) => {

      if (data.clk) setClk(data.clk);
      if (data.initialClk) setInitialClk(data.initialClk);

      data.mc.forEach(async (mc) => {
        const ladders = { ...updates };
        const updatedNonRunners = { ...nonRunners };

        // Update the market status
        if (mc.marketDefinition) {
          for (let i = 0; i < mc.marketDefinition.runners.length; i += 1) {
            if (mc.marketDefinition.runners[i].status === 'REMOVED') {
              if (mc.marketDefinition.runners[i].id in ladders) {
                delete ladders[mc.marketDefinition.runners[i].id];
              }
              if (mc.marketDefinition.runners[i].id in updatedNonRunners === false) {
                updatedNonRunners[mc.marketDefinition.runners[i].id] = ladders[mc.marketDefinition.runners[i].id];
              }
            }
          }
          loadNonRunners(updatedNonRunners);
        }

        if (mc.rc) {
          for (let i = 0; i < mc.rc.length; i += 1) {
            if (ladders[mc.rc[i].id]) {
              //* Runner found so we update our object with the mc runner data
              ladders[mc.rc[i].id] = UpdateLadder(ladders[mc.rc[i].id], mc.rc[i]);

              const currentLTP = mc.rc[i].ltp || ladders[mc.rc[i].id].ltp[0];

              // stop Entry
              const stopEntryBetsToRemove = checkStopEntryTargetMet(stopEntryList, mc.rc[i].id, currentLTP);
              if (!_.isEmpty(stopEntryBetsToRemove)) {
                for (let i = 0; i < stopEntryBetsToRemove.length; i += 1) {
                  const { marketId, selectionId, side, size, price } = stopEntryBetsToRemove; 
                  placeOrder({
                    marketId, selectionId, side, size, price,
                    customerStrategyRef: crypto.randomBytes(15).toString('hex').substring(0, 15),
                  });
                  removeBet({ rfs: stopEntryBetsToRemove[i].rfs });
                }
                removeMultiSelectionStopEntryBets(extractStopEntryRfs(stopEntryBetsToRemove));
              }

              // Increment and check the stoplosses
              if (stopLossList[mc.rc[i].id] && stopLossList[mc.rc[i].id].assignedIsOrderMatched) {
                const SL = { ...stopLossList[mc.rc[i].id] };
                const prevLTP = ladders[mc.rc[i].id].ltp[1] || ladders[mc.rc[i].id].ltp[0];

                const targetMet = checkStopLossHit(SL, currentLTP);

                if (targetMet) {
                  const newMatchedBets = Object.values(matchedBets).filter((bet) => bet.selectionId == SL.selectionId);
                  placeOrder({
                    marketId: SL.marketId,
                    selectionId: SL.selectionId,
                    side: SL.side,
                    size: CalculateLadderHedge(parseFloat(SL.price), newMatchedBets, 'hedged').size,
                    price: SL.price,
                    customerStrategyRef: crypto.randomBytes(15).toString('hex').substring(0, 15),
                  });
                  removeStopLoss({ selectionId: SL.selectionId }); // Remove the SL
                  removeBet({ rfs: SL.rfs }); // Remove the SL from DB
                } else if (SL.trailing && ((currentLTP < prevLTP && SL.side == 'BACK') || (currentLTP > prevLTP && SL.side == 'LAY'))) {
                  SL.ticks += 1;
                  updateTicks(SL); //! Update SQLite with new ticks
                  const newStopLossList = { ...stopLossList };
                  newStopLossList[SL.selectionId] = SL;
                  updateStopLossList(newStopLossList);
                }
              }
            } else if (!(mc.rc[i].id in nonRunners) && !(mc.rc[i].id in updatedNonRunners)) {
              // Runner found so we create the new object with the raw data
              ladders[mc.rc[i].id] = CreateLadder(mc.rc[i]);

              if (i === mc.rc.length - 1) {
                let j;
                if (eventType.id === '4339') {
                  //! Used to track ladder bet when dragging & dropping ladders
                  const newOrderList = {};
                  for (j = 0; j < sortedLadder.length; j += 1) {
                    newOrderList[j] = sortedLadder[j];
                  }
                  updateLadderOrder(newOrderList);
                } else {
                  const sortedLadderIndices = sortLadder(ladders);
                  setSortedLadder(sortedLadderIndices);
                  updateExcludedLadders(sortedLadderIndices.slice(6, sortedLadderIndices.length));
                  //! Used to track ladder bet when dragging & dropping ladders
                  const newOrderList = {};
                  for (j = 0; j < sortedLadderIndices.length; j += 1) {
                    newOrderList[j] = sortedLadderIndices[j];
                  }
                  updateLadderOrder(newOrderList);
                }
              }
            }
          }
          setUpdates(ladders);
          setIsUpdated(false);
        }
      });
    },
    [updates, nonRunners, loadNonRunners, stopEntryList, updateStopEntryList, placeOrder, unmatchedBets, matchedBets, stopLossList, removeStopLoss, eventType.id, sortedLadder, setSortedLadder, updateExcludedLadders],
  );

  /**
   * Listen for bet Change Messages from the Exchange Streaming socket and create/update them
   * @param {obj} data The bet change message data:
   */
  const onReceiveOrderMessage = useCallback(
    async (data) => {
      if (data.oc) {
        for (let i = 0; i < data.oc.length; i += 1) {
          if (data.oc[i].orc) {
            const { id: marketId } = data.oc[i];
            for (let j = 0; j < data.oc[i].orc.length; j += 1) {
              if (data.oc[i].orc[j].uo) {
                const { id: selectionId } = data.oc[i].orc[j];
                for (let k = 0; k < data.oc[i].orc[j].uo.length; k += 1) {
                  // If the bet isn't in the unmatchedBets, we should delete it.
                  const { id: betId, s: size, p: price, sr: sizeRemaining, sm: sizeMatched, rfs, status } = data.oc[i].orc[j].uo[k];
                  if (sizeRemaining === 0 && sizeMatched === 0) {
                    //! this is what happens when an bet doesn't get any matched
                    removeUnmatchedBet({ betId });
                  } else if (sizeRemaining === 0 || status === 'EXECUTION_COMPLETE') {
                    setBetExecutionComplete({ betId, sizeMatched, sizeRemaining });
                  }

                  if (stopLossList[selectionId]) {
                    const isStopLossMatched = checkStopLossTrigger(stopLossList[selectionId], rfs, sizeRemaining);
                    if (isStopLossMatched) {
                      setStopLossBetMatched({ selectionId });
                      updateOrderMatched({ rfs, assignedIsOrderMatched: true });
                    }
                  }

                  if (tickOffsetList[rfs]) {
                    const tosTriggered = checkTickOffsetTrigger(tickOffsetList[rfs], sizeMatched);
                    if (tosTriggered) {
                      placeOrder({
                        marketId,
                        selectionId,
                        side: tickOffsetList[rfs].side,
                        size,
                        price,
                        customerStrategyRef: crypto.randomBytes(15).toString('hex').substring(0, 15),
                      });
                      removeTickOffset({ selectionId });
                      removeBet({ rfs });
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    [stopLossList, tickOffsetList, removeUnmatchedBet, setBetExecutionComplete, setStopLossBetMatched, placeOrder, removeTickOffset],
  );

  const onMarketDisconnect = useCallback(
    async ({ errorCode, errorMessage }) => {
      handleAuthError(errorCode);
      if (errorMessage) {
        setConnectionError(`${errorMessage.split(':')[0]}, connection id: ${connectionId}`);
      }
    },
    [connectionId],
  );

  const retrieveMarket = async () => {
    const marketId = getQueryVariable('marketId');

    // Check if the page has query parameter 'marketId'
    // Load the market if found
    if (marketId) {
      const marketCatalogue = await fetchData(`/api/get-market-info?marketId=${marketId}`);
      if (marketCatalogue && marketCatalogue.length >= 1) {
        const { marketId, marketName, marketStartTime, description, event, eventType, runners } = marketCatalogue[0];
        setSortedLadder(sortGreyHoundMarket(eventType.id, runners));
        setMarketId(marketId);
        setMarketName(marketName);
        setMarketDescription(description);
        setMarketStartTime(marketStartTime);
        setEvent(event);
        setEventType(eventType);
        loadRunners(CreateRunners(runners));
        setRunner(runners[0]);
        const selectionNames = {};

        const runnerIds = Object.keys(runners);

        for (let i = 0; i < runnerIds.length; i += 1) {
          selectionNames[runnerIds[i]] = runners[runnerIds[i]].runnerName;
        }

        //* Subscribe to Market Change Messages (MCM) via the Exchange Streaming API
        socket.emit('market-subscription', { marketId });

        const loadedBackOrders = {};
        const loadedLayOrders = {};
        const loadedStopEntryOrders = {};
        const loadedTickOffsetOrders = {};
        const loadedFillOrKillOrders = {};
        const loadedStopLossOrders = {};

        const bets = await getAllBets(marketId);
        bets.map(async (bet) => {
          if (bet.marketId === marketId) {
            switch (bet.strategy) {
              case 'Back':
                loadedBackOrders[bet.selectionId] = loadedBackOrders[bet.selectionId] ? loadedBackOrders[bet.selectionId].concat(bet) : [bet];
                break;
              case 'Lay':
                loadedLayOrders[bet.selectionId] = loadedLayOrders[bet.selectionId] ? loadedLayOrders[bet.selectionId].concat(bet) : [bet];
                break;
              case 'Stop Entry':
                loadedStopEntryOrders[bet.selectionId] = loadedStopEntryOrders[bet.selectionId] ? loadedStopEntryOrders[bet.selectionId].concat(bet) : [bet];
                break;
              case 'Tick Offset':
                loadedTickOffsetOrders[bet.selectionId] = bet;
                break;
              case 'Fill Or Kill':
                loadedFillOrKillOrders[bet.betId] = bet;
                break;
              case 'Stop Loss':
                loadedStopLossOrders[bet.selectionId] = bet;
                break;
              default:
                break;
            }
          }
        });
        updateBackList(loadedBackOrders);
        updateLayList(loadedLayOrders);
        updateStopEntryList(loadedStopEntryOrders);
        updateTickOffsetList(loadedTickOffsetOrders);
        updateFillOrKillList(loadedFillOrKillOrders);
        updateStopLossList(loadedStopLossOrders);
      }
    }
  };
  useInterval(() => {
    if (!isUpdated) {
      loadLadder(updates);
      setIsUpdated(true);
    }
  }, ONE_SECOND);

  useEffect(() => {
    const loadData = async () => {
      await getPremiumStatus();
      await retrieveMarket();
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (marketId) {
      const betsWithRfs = Object.values(unmatchedBets).filter((bet) => bet.rfs && bet.rfs !== 'None');
      if (betsWithRfs.length > 0) {
        socket.emit('order-subscription', {
          customerStrategyRefs: JSON.stringify(betsWithRfs),
        });
      }
    }
  }, [marketId, socket, unmatchedBets]);

  useEffect(() => {
    socket.on('mcm', onReceiveMarketMessage);
    socket.on('ocm', onReceiveOrderMessage);
    socket.on('connection-id', (connectionId) => setConnectionId(connectionId));
    socket.on('subscription-error', onMarketDisconnect);
    socket.on('market-definition', onReceiveMarketDefinition);

    return () => {
      socket.off('mcm');
      socket.off('ocm');
      socket.off('connection-id');
      socket.off('subscription-error');
      socket.off('market-definition');
    };
  }, [onMarketDisconnect, onReceiveMarketDefinition, onReceiveMarketMessage, onReceiveOrderMessage, socket]);

  useInterval(() => retrieveBets(), TWO_HUNDRED_AND_FIFTY_MILLISECONDS);

  useEffect(() => {
    const listMarketPL = async () => {
      const result = await fetchData(`/api/list-market-pl?marketId=${marketId}`);
      if (result && result[0]) {
        const selectionPL = result[0].profitAndLosses.reduce((acc, item) => {
          acc[item.selectionId] = item.ifWin;
          return acc;
        }, {});
        setMarketPL(selectionPL);
      }
    };
    if (marketId) {
      listMarketPL();
    }
  }, [marketId, matchedBets, setMarketPL]);

  if (isLoading) return <Spinner />;
  return (
    <div className="horizontal-scroll-wrapper">
      <div className="root">
        <Title />
        <Siderbar />
        <main className="content">
          <ConnectionStatus connectionError={connectionError} setConnectionError={setConnectionError} marketId={marketId} clk={clk} initialClk={initialClk} socket={socket} />
          <Draggable />
          {Views[view] || <HomeView />}
          <PremiumPopup />
        </main>
      </div>
    </div>
  );
};

const AppWithSocket = (props) => <SocketContext.Consumer>{(socket) => <App {...props} socket={socket} />}</SocketContext.Consumer>;

const mapStateToProps = (state) => ({
  view: state.settings.view,
  isLoading: state.settings.isLoading,
  inPlay: state.market.inPlay,
  inPlayTime: state.market.inPlayTime,
  marketOpen: state.market.marketOpen,
  marketId: state.market.marketId,
  eventType: state.market.eventType,
  ladders: state.market.ladder,
  sortedLadder: state.market.sortedLadder,
  nonRunners: state.market.nonRunners,
  unmatchedBets: state.order.bets.unmatched,
  matchedBets: state.order.bets.matched,
  stopLossList: state.stopLoss.list,
  tickOffsetList: state.tickOffset.list,
  stopEntryList: state.stopEntry.list,
});

const mapDispatchToProps = {
  setIsLoading,
  setPremiumStatus,
  setMarketId,
  setMarketName,
  setMarketDescription,
  setMarketStartTime,
  setEvent,
  setEventType,
  closeMarket,
  loadLadder,
  setSortedLadder,
  updateLadderOrder,
  updateExcludedLadders,
  setRunner,
  loadRunners,
  loadNonRunners,
  setMarketStatus,
  setInPlay,
  setInPlayTime,
  setMarketPL,
  setStopLossBetMatched,
  removeStopLoss,
  updateStopLossList,
  removeTickOffset,
  updateTickOffsetList,
  updateStopEntryList,
  removeMultiSelectionStopEntryBets,
  updateLayList,
  updateBackList,
  placeOrder,
  addUnmatchedBet,
  addMatchedBet,
  removeUnmatchedBet,
  updateSizeMatched,
  setBetExecutionComplete,
  updateFillOrKillList,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppWithSocket);
