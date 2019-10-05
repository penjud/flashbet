import React from "react";
import { connect } from "react-redux";

const DraggableGraph = props => {

  return props.selection && props.graph.open ? (
    <img
      alt={"Chart"}
      style={{pointerEvents: 'none'}}
      src={`https://sportsiteexweb.betfair.com/betting/LoadRunnerInfoChartAction.do?marketId=${props.market.marketId.slice(
        2,
        props.market.marketId.length
      )}&selectionId=${props.selection.selectionId}&handicap=0`}
    />
  ) : null;
};

const mapStateToProps = state => {
  return {
    marketOpen: state.market.marketOpen,
    market: state.market.currentMarket,
    selection: state.market.runnerSelection,
    graph: state.graph
  };
};

export default connect(mapStateToProps)(DraggableGraph);
