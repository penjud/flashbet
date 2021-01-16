import React, { useMemo } from 'react';
import { connect } from 'react-redux';
//* Utils
import { calcBackProfit, twoDecimalPlaces } from '../../../utils/Bets/BettingCalculations';
import { combinePartiallyMatchedBets } from '../../../utils/Bets/CombineUnmatchedOrders';
//* JSS
import useStyles from '../../../jss/components/Sidebar/market/betsStyle';

const MatchedBets = ({ marketOpen, marketName, runners, bets }) => {
  const classes = useStyles();
  const selections = useMemo(() => combinePartiallyMatchedBets(bets), [bets]);

  return (
    <div>
      <table className={classes.menuBets}>
        <tbody>
          <tr className={classes.heading}>
            <td>
              <button
                type="button"
                className={classes.button}
              />
            </td>
            <td>Odds</td>
            <td>Stake</td>
            <td>P/L</td>
          </tr>
          <tr>
            <td className={classes.event} colSpan={4}>
              {marketName}
            </td>
          </tr>
          {marketOpen
            ? selections.map((selection, idx) => {
              const selectionObject = runners[selection];
              if (!selectionObject) return null;

              const filteredOrders = Object.values(bets.matched).filter((order) => order.selectionId === selection);
              return (

                <React.Fragment key={`sidebar-matched-bet-${selection}-${idx}`}>
                  <tr className={classes.selection} colSpan={4}>
                    <td>{selectionObject.runnerName}</td>
                  </tr>
                  {
                    filteredOrders.map((order, idx) => {
                      const PL = calcBackProfit(order.size, order.price, order.side === 'BACK' ? 0 : 1);
                      return (
                        <React.Fragment key={`sidebar-matched-bet-filtered-${order.selectionId}-${idx}`}>
                          <tr
                            className={classes.matchedBet}
                            style={{
                              backgroundColor: order.side === 'BACK' ? '#007aaf' : '#d4696b',
                            }}
                          >
                            <td>
                              <button type="button" style={{ height: '22px', width: 'auto', visibility: 'collapse' }} />
                            </td>

                            <td>{twoDecimalPlaces(order.price)}</td>
                            <td>{order.sizeMatched}</td>
                            <td
                              className={classes.profitLoss}
                              style={{
                                color:
                                  PL === '0.00'
                                    ? 'black'
                                    : PL > 0
                                      ? 'green'
                                      : 'red',
                              }}
                            >
                              {PL}
                            </td>
                          </tr>

                        </React.Fragment>
                      );
                    })
                  }
                </React.Fragment>

              );
            })
            : null}
        </tbody>
      </table>
    </div>
  );
};

const mapStateToProps = (state) => ({
  marketOpen: state.market.marketOpen,
  marketName: state.market.marketName,
  runners: state.market.runners,
  bets: state.order.bets,
});

export default connect(mapStateToProps)(MatchedBets);
