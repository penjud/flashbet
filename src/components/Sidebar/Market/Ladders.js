import React from "react";
import { connect } from "react-redux";
import { updateExcludedLadders, updateLadderOrder } from "../../../actions/market";

const Ladder = props => {
  const deconstructLadder = ladder => {

    if (ladder === undefined) {
      return {}
    }

    const data = {
      key: ladder.id || null,
      ltp: null,
      color: "#FFFFFF"
    };

    let now = new Date().getTime();

    if (ladder.ltp && ladder.ltp[0]) {
      data.ltpStyle =
        ladder.ltp[0] < ladder.ltp[1] && now - ladder.ltpDelta.getTime() < 2000 // #0AFD03 (Green Lower LTP)
          ? { background: "#0AFD03", color: "#000" }
          : ladder.ltp[0] > ladder.ltp[1] && now - ladder.ltpDelta.getTime() < 2000 // #FC0700 (Red Higher LTP)
            ? { background: "#FC0700", color: "#FFFF00" }
            : ladder.ltp[0] // #FFFF00 (Yellow Same LTP)
              ? { background: "#FFFF00", color: "#000" }
              : { background: "#FFF", color: "#000" } // #FFF (No Value)

      data.ltp = ladder.ltp[0];
    }

    data.atb = ladder.atb && ladder.atb[0] ? ladder.atb[0][0] : null;
    data.atl = ladder.atl && ladder.atl[0] ? ladder.atl[0][0] : null;

    return data;
  };

  const renderRunners = () => {
    return props.ladder.map(ladder => {
      const { key, atb, atl, ltp, ltpStyle } = deconstructLadder(ladder);
      return (
        <tr>
          <td>{props.runners[key].runnerName}</td>
          <td>{atl}</td>
          <td style={ltpStyle}>{ltp}</td>
          <td>{atb}</td>
          <td>
            <input
              type="checkbox"
              checked={props.excludedLadders.indexOf(key) === -1} // false automatically omits attribute
              onClick={() => {
                if (Object.keys(props.ladderOrder).length > 0) {
                  // we send it to the end when we select a new ladder

                  const newLadderOrder = Object.values(props.ladderOrder).filter(item => item !== key).concat(key)
                  // convert it back to an object
                  const newLadderOrderObject = {};
                  newLadderOrder.map((item, index) => {
                    newLadderOrderObject[index] = item;
                  })
                  props.onChangeLadderOrder(newLadderOrderObject)
                }

                if (props.excludedLadders.indexOf(key) === -1) {
                  props.onChangeExcluded(props.excludedLadders.concat(key))
                } else {
                  props.onChangeExcluded(props.excludedLadders.filter(item => item !== key))
                }
              }} />
          </td>
        </tr>
      );
    });
  };

  return (
    <>
      {props.marketOpen ?
        <table id="menu-ladder">
          <tbody>{renderRunners()}</tbody>
        </table>
        : null}
    </>
  );
};

const mapStateToProps = state => {
  return {
    marketOpen: state.market.marketOpen,
    market: state.market.currentMarket,
    ladder: state.market.ladder,
    sortedLadder: state.market.sortedLadder,
    runners: state.market.runners,
    excludedLadders: state.market.excludedLadders,
    ladderOrder: state.market.ladderOrder,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onChangeExcluded: excludedLadders => dispatch(updateExcludedLadders(excludedLadders)),
    onChangeLadderOrder: order => dispatch(updateLadderOrder(order)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Ladder);