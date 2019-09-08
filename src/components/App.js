import React, { useEffect } from "react";
import { connect } from 'react-redux';
import * as actions from '../actions/settings';
import * as actions2 from '../actions/market';
import Siderbar from "./Sidebar";
import HomeView from "./HomeView/index";
import LadderView from "./LadderView/OddsTable";
import GridView from "./GridView/";
import SocketContext from "../SocketContext";

const App = props => {

  let sessionKey = localStorage.getItem("sessionKey");
  let email = localStorage.getItem("username");

  fetch(`/api/load-session?sessionKey=${encodeURIComponent(sessionKey)}&email=${encodeURIComponent(email)}`)
  .then(res => console.log(res));

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
    });

  const getQueryVariable = variable => {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
                var pair = vars[i].split("=");
    if(pair[0] === variable){return pair[1];}
     }
     return(false);
  };

  useEffect(() => {

    let marketId = getQueryVariable("marketId");

    if (marketId !== false) {
      fetch(`/api/get-market-info?marketId=${marketId}`)
      .then(res => res.json())
      .then(data => {
        if (data.result.length > 0) {
          console.log(data.result[0]);

          const runners = {};
          for (let i = 0; i < data.result[0].runners.length; i++) {
            runners[data.result[0].runners[i].selectionId] = data.result[0].runners[i];
          }
          
          props.onReceiveRunners(runners);
          props.onReceiveMarket(data.result[0]);
          props.onSelectRunner(data.result[0].runners[0].metadata);
          props.socket.emit('market-subscription', {marketId: data.result[0].marketId});
        }
      });
    }

    props.socket.on('mcm', data  => {
      console.log(`msc ${data}`);
      const ladder = {};
      for (let i = 0; i < data.rc.length; i++ ){
        ladder[data.rc[i].id] = data.rc[i];
        console.log(ladder[data.rc[i].id]);
      }

      console.log(ladder);
      props.onReceiverLadder(ladder);
    });
  },[]);

  const renderView = () => {
    switch (props.view) {
      case "HomeView":
        return <HomeView/>;
      case "LadderView":
        return <LadderView/>;
      case "GridView":
        return <GridView/>;
      default:
        return <HomeView/>;
    }
  };

  return (
    <div className="horizontal-scroll-wrapper">
      <div className="root">
        <Siderbar/>
        <main className="content">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

const AppWithSocket = props => (
  <SocketContext.Consumer>
    {socket => <App {...props} socket={socket} />}
  </SocketContext.Consumer>
)

const mapStateToProps = state => {
	return {
    view: state.settings.view,
    market: state.market.currentMarket,
    marketOpen: state.market.marketOpen
	}
}

const mapDispatchToProps = dispatch => {
	return {
		onToggleSounds: isSelected => dispatch(actions.toggleSound(isSelected)),
    onToggleTools: settings => dispatch(actions.toggleTools(settings)),
		onToggleUnmatchedBets: settings => dispatch(actions.toggleUnmatchedBets(settings)),
		onToggleMatchedBets: settings => dispatch(actions.toggleMatchedBets(settings)),
		onToggleGraph: settings => dispatch(actions.toggleGraph(settings)),
		onToggleMarketInformation: settings => dispatch(actions.toggleMarketInformation(settings)),
    onToggleRules: settings => dispatch(actions.toggleRules(settings)),
    onReceiveMarket: market => dispatch(actions2.loadMarket(market)),
    onSelectRunner: runner => dispatch(actions2.setRunner(runner)),
    onReceiveRunners: runners => dispatch(actions2.loadRunners(runners)),
    onReceiverLadder: ladder => dispatch(actions2.loadLadder(ladder))
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(AppWithSocket);