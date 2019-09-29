import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import * as actions from "../actions/settings";
import * as actions2 from "../actions/market";
import { updateStopLossList } from '../actions/stopLoss'
import { updateTickOffsetList } from "../actions/tickOffset";
import Siderbar from "./Sidebar";
import HomeView from "./HomeView/";
import LadderView from "./LadderView/";
import GridView from "./GridView/";
import SocketContext from "../SocketContext";
import { Helmet } from "react-helmet";
import getQueryVariable from "../utils/GetQueryVariable";
import { AddRunner } from "../utils/ladder/AddRunner";
import { UpdateRunner } from "../utils/ladder/UpdateRunner";
import PremiumPopup from "./PremiumPopup";
import { checkStopLossHit } from "../utils/TradingStategy/StopLoss";
import { placeOrder } from "../actions/order";

const App = props => {

  /**
   * Send the session key to the server to login to BetFair
   */
  let sessionKey = localStorage.getItem("sessionKey");
  let email = localStorage.getItem("username");

  fetch(
    `/api/load-session?sessionKey=${encodeURIComponent(
      sessionKey
    )}&email=${encodeURIComponent(email)}`
  );

  useEffect(() => {
    /**
     * Fetch settings from the database and load them into redux state
     * @return {Object} settings
     *   User settings.
     */
    fetch(`/api/get-user-settings`)
      .then(res => res.json())
      .then(settings => {
        props.onToggleSounds(settings.sounds);
        props.onToggleTools(settings.tools);
        props.onToggleUnmatchedBets(settings.unmatchedBets);
        props.onToggleMatchedBets(settings.matchedBets);
        props.onToggleGraph(settings.graphs);
        props.onToggleMarketInformation(settings.marketInfo);
        props.onToggleRules(settings.rules);
        props.onReceiveStakeBtns(settings.stakeBtns);
        props.onReceiveLayBtns(settings.layBtns);
      });

    /**
     * @return {Boolean} premiumStatus
     *   Premium membership status required to access the LadderView.
     */
    fetch(`/api/premium-status`)
      .then(res => res.json())
      .then(premiumStatus => {
        props.setPremiumStatus(premiumStatus);
      });
  }, []);

  useEffect(() => {
    let marketId = getQueryVariable("marketId");

    // Check if the page has query parameter 'marketId'
    // Load the market if found
    if (marketId !== false) {
      fetch(`/api/get-market-info?marketId=${marketId}`)
        .then(res => res.json())
        .then(data => {
          if (data.result.length > 0) {
            console.log(data.result[0]);

            const runners = {};
            for (let i = 0; i < data.result[0].runners.length; i++) {
              let selectionId = data.result[0].runners[i].selectionId;
              runners[selectionId] = data.result[0].runners[i];

              // The Stake/Liability buttons for the GridView
              runners[selectionId].order = {
                visible: false,
                backLay: 0,
                stakeLiability: 0,
                stake: 2,
                price: 0
              };
            }

            props.onUpdateRunners(runners);
            props.onReceiveMarket(data.result[0]);
            props.onSelectRunner(data.result[0].runners[0]);

            // Subscribe to Market Change Messages (MCM) via the Exchange Streaming API
            props.socket.emit("market-subscription", {
              marketId: data.result[0].marketId
            });
          }
        });
    }
  }, []);

  useEffect(() => {
    /**
     * Listen for Market Change Messages from the Exchange Streaming socket and create/update them
     * @param {obj} data The market change message data: { rc: [(atb, atl, batb, batl, tv, ltp, id)] }
     */
    
    props.socket.on("mcm", data => {
      if (
        !props.marketOpen &&
        data.marketDefinition &&
        data.marketDefinition.status
      ) {
        props.onMarketStatusChange(data.marketDefinition.status);
      }

      var ladders = {};

      const length = data.rc.length;

      const adjustedStopLossList = Object.assign({}, props.stopLossList)

      for (var i = 0; i < length; i++) {
        let key = [data.rc[i].id];
        if (key in props.ladders) {
          // Runner found so we update our object with the raw data
          ladders[key] = UpdateRunner(props.ladders[key], data.rc[i]);

          // We increment and check the stoplosses
          if (props.stopLossList[key] !== undefined) {
            let adjustedStopLoss = Object.assign({}, props.stopLossList[key])
            if (props.stopLossList[key].trailing && data.rc[i].ltp > props.ladders[key].ltp[0]) {
              adjustedStopLoss.tickOffset = adjustedStopLoss.tickOffset + 1; 
            }

            // if it doesn't have a reference or the order has been matched
            if (adjustedStopLoss.rfs === undefined || (adjustedStopLoss.rfs && adjustedStopLoss.assignedIsOrderMatched)) {
              const stopLossCheck = checkStopLossHit(adjustedStopLoss.matchedPrice, data.rc[i].ltp, adjustedStopLoss.side.toLowerCase(), adjustedStopLoss.tickOffset);
              if (stopLossCheck.targetMet) {
                props.onPlaceOrder({
                  marketId: adjustedStopLoss.marketId,
                  selectionId: adjustedStopLoss.selectionId,
                  side: adjustedStopLoss.side,
                  size: adjustedStopLoss.size,
                  price: stopLossCheck.priceReached,
                })
                adjustedStopLoss = null;
              }
            }
            adjustedStopLossList[key] = adjustedStopLoss;
          } 

          const filteredStopLosses = adjustedStopLossList.filter(stoploss => stoploss != null)
          props.onChangeStopLossList(filteredStopLosses);

        } else {
          // Runner not found so we create the new object with the raw data
          ladders[key] = AddRunner(key, data.rc[i]);
          console.log(ladders[key]);
        }
      }
      console.log(ladders);

      // Turn the socket off to prevent the listener from runner more than once. It will back on once the component reset.
      props.socket.off("mcm");

      props.onReceiverLadders(ladders);
      props.onChangeExcludedLadders(Object.keys(ladders).slice(6, Object.keys(ladders).length))
    });

    /**
     * Listen for Order Change Messages from the Exchange Streaming socket and create/update them
     * @param {obj} data The order change message data:
     */
    props.socket.on("ocm", data => {

      const checkForMatchInStopLoss = Object.assign({}, props.stopLossList)
      const checkForMatchInTickOffset = Object.assign({}, props.tickOffsetList)

      data.oc.map(changes => {
        changes.orc.map(runner => { 
          runner.uo.map(order => {
              // if the strategies are the same and all the order has been matched (STOPLOSS)
              if (props.stopLossList[runner.id] !== undefined && props.stopLossList[runner.id].rfs === order.rfs && order.sr === 0) {
                checkForMatchInStopLoss[runner.id].assignedIsOrderMatched = true;
              }
              
              // if the strategies are the same and enough of the order has been matched (TICK OFFSET)
              const tickOffsetItem = props.tickOffsetList[order.rfs]
              if (tickOffsetItem !== undefined && order.rfs.sm / tickOffsetItem.size >= tickOffsetItem.percentage / 100) {
                props.onPlaceOrder({
                  marketId: tickOffsetItem.marketId,
                  selectionId: tickOffsetItem.selectionId,
                  side: tickOffsetItem.side === "BACK" ? "LAY" : "BACK",
                  size: tickOffsetItem.size,
                  price: tickOffsetItem.newPrice, 
                })
                checkForMatchInTickOffset[order.rfs] = null;
              }
            
          })
        })
      })

      const filterCompletedTickOffset = checkForMatchInTickOffset.filter(item => item !== null);

      props.onChangeTickOffsetList(filterCompletedTickOffset);
      props.onChangeStopLossList(checkForMatchInStopLoss);

      props.socket.off("ocm");
    });
  }, [props.ladders]);

  const renderView = () => {
    switch (props.view) {
      case "HomeView":
        return <HomeView />;
      case "LadderView":
        return <LadderView />;
      case "GridView":
        return <GridView/>;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="horizontal-scroll-wrapper">
      <div className="root">
        {props.marketOpen ? (
            <Helmet>
              <title>
                {`${new Date(
                  props.market.marketStartTime
                ).toLocaleTimeString()} ${props.market.marketName}  ${
                  props.market.event.venue
                }`}
              </title>
            </Helmet>
        ) : null}
        <Siderbar />
        <main className="content">
        {renderView()}
        {<PremiumPopup/>}
        </main>
      </div>
    </div>
  );
};

const AppWithSocket = props => (
  <SocketContext.Consumer>
    {socket => <App {...props} socket={socket} />}
  </SocketContext.Consumer>
);

const mapStateToProps = state => {
  return {
    view: state.settings.view,
    market: state.market.currentMarket,
    marketOpen: state.market.marketOpen,
    ladders: state.market.ladder,
    premiumMember: state.settings.premiumMember,
    premiumPopup: state.settings.premiumPopupOpen,
    stopLossList: state.stopLoss.list,
    tickOffsetList: state.tickOffset.list
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onToggleSounds: isSelected => dispatch(actions.toggleSound(isSelected)),
    onToggleTools: settings => dispatch(actions.toggleTools(settings)),
    onToggleUnmatchedBets: settings =>
      dispatch(actions.toggleUnmatchedBets(settings)),
    onToggleMatchedBets: settings =>
      dispatch(actions.toggleMatchedBets(settings)),
    onToggleGraph: settings => dispatch(actions.toggleGraph(settings)),
    onToggleMarketInformation: settings =>
      dispatch(actions.toggleMarketInformation(settings)),
    onToggleRules: settings => dispatch(actions.toggleRules(settings)),
		onReceiveStakeBtns: data => dispatch(actions.setStakeBtns(data)),
		onReceiveLayBtns: data => dispatch(actions.setLayBtns(data)),
    onReceiveMarket: market => dispatch(actions2.loadMarket(market)),
    onSelectRunner: runner => dispatch(actions2.setRunner(runner)),
    onUpdateRunners: runners => dispatch(actions2.loadRunners(runners)),
    onReceiverLadders: ladders => dispatch(actions2.loadLadder(ladders)),
    onChangeExcludedLadders: excludedLadders => dispatch(actions2.updateExcludedLadders(excludedLadders)),
    onMarketStatusChange: isOpen => dispatch(actions2.setMarketStatus(isOpen)),
    setPremiumStatus: isPremium => dispatch(actions.setPremiumStatus(isPremium)),
    onChangeStopLossList: list => dispatch(updateStopLossList(list)),
    onChangeTickOffsetList: list => dispatch(updateTickOffsetList(list)),
    onPlaceOrder: order => dispatch(placeOrder(order)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppWithSocket);
