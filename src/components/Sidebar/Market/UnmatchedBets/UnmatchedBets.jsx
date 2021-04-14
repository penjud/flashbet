import React, { useCallback } from 'react';
import { connect } from 'react-redux';
//* Actions
import { cancelBet, removeUnmatchedBet, updateBetPrice } from '../../../../actions/bet';
import { removeBackBet, updateBackBetPrice } from '../../../../actions/back';
import { removeLayBet, updateLayBetPrice } from '../../../../actions/lay';
import { removeStopEntryBet, updateStopEntryBetPrice } from '../../../../actions/stopEntry';
import { removeStopLoss, updateStopLossBetPrice } from '../../../../actions/stopLoss';
import { removeTickOffset, updateTickOffsetBetPrice } from '../../../../actions/tickOffset';
import { removeFillOrKill } from '../../../../actions/fillOrKill';
//* Selectors
import { getMarketUnmatchedBets } from '../../../../selectors/orderSelector';
//* Utils
import { getPriceNTicksAway } from '../../../../utils/Bets/PriceCalculations';
import { removeBet, replaceOrders, updatePrice } from '../../../../http/dbHelper';
//* HTTP
import postData from '../../../../http/postData';
import Bet from './Bet';
//* JSS
import useStyles from '../../../../jss/components/Sidebar/market/betsStyle';

const UnmatchedBets = ({
  marketOpen,
  marketName,
  marketStartTime,
  runners,
  backList,
  layList,
  stopEntryList,
  tickOffsetList,
  stopLossList,
  fillOrKillList,
  unmatchedBets,
  updateBetPrice,
  cancelBet,
  removeUnmatchedBet,
  removeBackBet,
  updateBackBetPrice,
  removeLayBet,
  updateLayBetPrice,
  removeStopEntryBet,
  updateStopEntryBetPrice,
  removeStopLoss,
  updateStopLossBetPrice,
  removeTickOffset,
  updateTickOffsetBetPrice,
  removeFillOrKill,

  rightClickTicks,
}) => {
  const classes = useStyles();
  const cancelOrder = useCallback(
    async ({ betId, marketId, rfs, selectionId, strategy }) => {
      //* Remove from SQLite
      removeBet({ rfs });

      if (betId) {
        //* Cancel on BetFair
        cancelBet(marketId, betId);

        if (fillOrKillList[betId]) {
          //* Remove Fill Or Kill from state
          removeFillOrKill({ betId });
        }
      }

      switch (strategy) {
        case 'Back':
          //* Remove custom Back bet from state
          removeBackBet({ rfs, selectionId });
          break;
        case 'Lay':
          //* Remove custom Lay bet from state
          removeLayBet({ rfs, selectionId });
          break;
        case 'Stop Entry':
          //* Remove Stop Entry bet from state
          removeStopEntryBet({ rfs, selectionId });
          break;
        case 'Tick Offset':
          //* Remove Tick Offset bet from state
          removeTickOffset({ rfs, selectionId });
          break;
        case 'Stop Loss':
          //* Remove Stop Loss bet from state
          removeStopLoss({ rfs, selectionId });
          break;
        default:
          break;
      }
    },
    [cancelBet, fillOrKillList, removeBackBet, removeFillOrKill, removeLayBet, removeStopEntryBet, removeStopLoss, removeTickOffset],
  );

  const replaceOrderPrice = useCallback(
    async (bet, newPrice) => {
      switch (bet.strategy) {
        case 'Back':
          updateBackBetPrice({ selectionId: bet.selectionId, rfs: bet.rfs, price: newPrice });
          break;
        case 'Lay':
          updateLayBetPrice({ selectionId: bet.selectionId, rfs: bet.rfs, price: newPrice });
          break;
        case 'Stop Entry':
          updateStopEntryBetPrice({ selectionId: bet.selectionId, rfs: bet.rfs, price: newPrice });
          break;
        case 'Tick Offset':
          updateTickOffsetBetPrice({ selectionId: bet.selectionId, price: newPrice });
          break;
        case 'Stop Loss':
          updateStopLossBetPrice({ selectionId: bet.selectionId, price: newPrice });
          break;
        case 'None': {
          const { status, instructionReports } = await postData('/api/replace-orders', {
            marketId: bet.marketId,
            betId: bet.betId,
            newPrice,
          });

          if (status === 'SUCCESS') {
            const { betId, instruction } = instructionReports[0].placeInstructionReport;
            updateBetPrice({ betId: bet.betId, newBetId: betId, price: instruction.limitOrder.price });
            removeUnmatchedBet({ betId: bet.betId });
          }
          break;
        }
        default:
          break;
      }
      updatePrice({ rfs: bet.rfs, price: newPrice });
    },
    [updateBackBetPrice, updateLayBetPrice, updateStopEntryBetPrice, updateTickOffsetBetPrice, updateStopLossBetPrice, updateBetPrice, removeUnmatchedBet],
  );

  const handleRightClick = useCallback(
    (order) => {
      replaceOrderPrice(order, getPriceNTicksAway(parseFloat(order.price), rightClickTicks));
    },
    [replaceOrderPrice, rightClickTicks],
  );

  return (
    <div>
      <table className={classes.menuBets}>
        <tbody>
          <tr className={classes.heading}>
            <td colSpan={2}>Odds</td>
            <td colSpan={2}>Stake</td>
            <td colSpan={4}>P/L</td>
            <td colSpan={1} />
          </tr>
          <tr>
            <td className={classes.event} colSpan={9}>
              {marketName}
            </td>
          </tr>
          {marketOpen
            ? Object.values(runners).map(({ runnerName, selectionId }) => {
                const list = [];

                const BETS = Object.values(unmatchedBets)
                  .filter((bet) => bet.selectionId == selectionId)
                  .map((bet) => <Bet bet={bet} handleRightClick={handleRightClick} cancelOrder={cancelOrder} marketStartTime={marketStartTime} />);
                if (BETS.length.length > 0) {
                  list.push(BETS);
                }

                if (backList[selectionId]) {
                  const BACK = Object.values(backList[selectionId]).map((bet) => <Bet bet={bet} handleRightClick={handleRightClick} cancelOrder={cancelOrder} marketStartTime={marketStartTime} />);
                  list.push(BACK);
                }

                if (layList[selectionId]) {
                  const LAY = Object.values(layList[selectionId]).map((bet) => <Bet bet={bet} handleRightClick={handleRightClick} cancelOrder={cancelOrder} marketStartTime={marketStartTime} />);
                  list.push(LAY);
                }

                if (stopEntryList[selectionId]) {
                  const SE = Object.values(stopEntryList[selectionId]).map((bet) => <Bet bet={bet} handleRightClick={handleRightClick} cancelOrder={cancelOrder} marketStartTime={marketStartTime} />);
                  list.push(SE);
                }

                if (stopLossList[selectionId]) {
                  const SL = <Bet bet={stopLossList[selectionId]} handleRightClick={handleRightClick} cancelOrder={cancelOrder} marketStartTime={marketStartTime} />;
                  list.push(SL);
                }

                if (tickOffsetList[selectionId]) {
                  const TOS = <Bet bet={tickOffsetList[selectionId]} handleRightClick={handleRightClick} cancelOrder={cancelOrder} marketStartTime={marketStartTime} />;
                  list.push(TOS);
                }

                const FOK = Object.values(fillOrKillList)
                  .filter((bet) => bet.selectionId == selectionId)
                  .map((bet) => <Bet bet={bet} handleRightClick={handleRightClick} cancelOrder={cancelOrder} marketStartTime={marketStartTime} />);
                if (FOK.length > 0) {
                  list.push(FOK);
                }

                if (list.length <= 0) return null;

                return (
                  <>
                    <tr className={classes.selection} colSpan={9}>
                      <td colSpan={9}>{runnerName}</td>
                    </tr>
                    {list}
                  </>
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
  marketStartTime: state.market.marketStartTime,
  runners: state.market.runners,
  stopLossList: state.stopLoss.list,
  tickOffsetList: state.tickOffset.list,
  stopEntryList: state.stopEntry.list,
  layList: state.lay.list,
  backList: state.back.list,
  fillOrKillList: state.fillOrKill.list,
  unmatchedBets: getMarketUnmatchedBets(state.order.bets, { marketId: state.market.marketId }),
  rightClickTicks: state.settings.rightClickTicks,
});

const mapDispatchToProps = {
  updateBetPrice,
  cancelBet,
  removeUnmatchedBet,
  removeBackBet,
  updateBackBetPrice,
  removeLayBet,
  updateLayBetPrice,
  removeStopEntryBet,
  updateStopEntryBetPrice,
  removeStopLoss,
  updateStopLossBetPrice,
  removeTickOffset,
  updateTickOffsetBetPrice,
  removeFillOrKill,
};

export default connect(mapStateToProps, mapDispatchToProps)(UnmatchedBets);
