import crypto from 'crypto';
import clsx from 'clsx';
import React, { memo, useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';
//* Actions
import { updateBackList } from '../../redux/actions/back';
import { updateLayList } from '../../redux/actions/lay';
import { addStopLoss, updateStopLossList } from '../../redux/actions/stopLoss';
import { addTickOffset, updateTickOffsetList } from '../../redux/actions/tickOffset';
import { updateStopEntryList } from '../../redux/actions/stopEntry';
import { addFillOrKill, updateFillOrKillList } from '../../redux/actions/fillOrKill';
import { cancelBets, placeOrder, updateOrders } from '../../redux/actions/bet';
import { getLTP } from '../../selectors/marketSelector';
import { getMatchedBets, getUnmatchedBets, getSelectionMatchedBets } from '../../selectors/orderSelector';
//* Utils
import { getStakeVal } from '../../selectors/settingsSelector';
import { ALL_PRICES, formatPrice } from '../../utils/Bets/PriceCalculations';
import { getOppositeSide } from '../../utils/Bets/GetOppositeSide';
import CalculateLadderHedge from '../../utils/ladder/CalculateLadderHedge';
import { calcTickOffsetPrice } from '../../utils/TradingStategy/TickOffset';
import { calcStopLossPrice } from '../../utils/TradingStategy/StopLoss';
//* Components
import Container from './Container';
import Header from './Header';
import BottomPanel from './BottomPanel';
import LadderRow from './Rows/LadderRow';
import OrderRow from './Rows/OrderRow/OrderRow';
import PercentageRow from './Rows/PercentageRow/PercentageRow';
import PriceRow from './Rows/PriceRow';
//* HTTP
import { saveBet } from '../../http/dbHelper';
//* JSS
import useStyles from '../../jss/components/LadderView/ladderStyle';

const isMoving = (prevProps, nextProps) => nextProps.draggingLadder === nextProps.selectionId && prevProps.order === nextProps.order;

const Ladder = memo(
  ({
    selectionId,
    ltp,
    expanded,
    placeOrder,
    updateOrders,
    order,
    selectionMatchedBets,
    unmatchedBets,
    matchedBets,
    setLadderSideLeft,
    updateStopLossList,
    backList,
    updateBackList,
    layList,
    updateLayList,
    addTickOffset,
    stopLossHedged,
    tickOffsetList,
    tickOffsetSelected,
    tickOffsetTicks,
    tickOffsetUnits,
    tickOffsetTrigger,
    tickOffsetHedged,
    addFillOrKill,
    fillOrKillSelected,
    fillOrKillSeconds,
    fillOrKillList,
    updateFillOrKillList,
    stopEntryList,
    updateStopEntryList,
    updateTickOffsetList,
    addStopLoss,
    stopLossOffset,
    stopLossList,
    stopLossUnits,
    stakeVal,
    draggingLadder,
    customStake,
  }) => {
    const classes = useStyles();
    const containerRef = useRef(null);
    const listRef = useRef();
    const [listRefSet, setlistRefSet] = useState(false);
    const [isReferenceSet, setIsReferenceSet] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const [isLadderDown, setLadderDown] = useState(false);
    const [ladderLocked, setLadderLocked] = useState(false);
    const [ladderLastHovered, setLadderLastHovered] = useState(Date.now());

    const ladderStyle = useMemo(() => (listRefSet ? { paddingRight: `${listRef.current.offsetWidth - listRef.current.clientWidth - 17}px` } : ''), [listRefSet]);
    const ltpHedge = useMemo(() => CalculateLadderHedge(ltp, selectionMatchedBets, 'hedged'), [ltp, selectionMatchedBets]);
    const hedgingAvailable = useMemo(() => ltpHedge.size >= 0.01, [ltpHedge]);

    const setReferenceSent = () => {
      setIsReferenceSet(true);
    };

    const onHoverLadder = useCallback(() => {
      if (!ladderLocked) {
        setLadderLocked(true);
        setLadderLastHovered(Date.now());
      }
    }, [ladderLocked]);

    const overLeaveLadder = useCallback(() => {
      if (ladderLocked && Date.now() - ladderLastHovered > 100) {
        setLadderLocked(false);
      }
    }, [ladderLastHovered, ladderLocked]);

    const scrollToLTP = useCallback(() => {
      const ltpIndex = ALL_PRICES.findIndex((item) => parseFloat(item) === parseFloat(ltp[0]));
      if (listRef.current !== null && listRef.current !== undefined && ltpIndex !== -1) {
        // we do the calculation because we start in reverse
        listRef.current.scrollToItem(ALL_PRICES.length - 1 - ltpIndex, 'center');
        setlistRefSet(true);
      }
    }, [ltp]);

    //* Scroll to the LTP when the ladder first loads
    useEffect(() => {
      setTimeout(() => {
        scrollToLTP();
      }, 1000);
    }, []);

    //* Scroll to the LTP when the ladder order changes
    useEffect(() => {
      if (!ladderLocked) scrollToLTP();
    }, [ltp, draggingLadder, scrollToLTP, ladderLocked]);

    const handleHedgeCellClick = useCallback(
      async (marketId, selectionId, unmatchedBetsOnRow, side, price, hedge) => {
        if (unmatchedBetsOnRow) {
          const { back, lay, stopLoss, tickOffset, stopEntry, fillOrKill } = await cancelBets(unmatchedBetsOnRow, backList, layList, stopLossList, tickOffsetList, stopEntryList, fillOrKillList, side);
          updateBackList(back);
          updateLayList(lay);
          updateStopLossList(stopLoss);
          updateTickOffsetList(tickOffset);
          updateStopEntryList(stopEntry);
          updateFillOrKillList(fillOrKill);
        } else if (hedge && hedge.size > 0) {
          const customerStrategyRef = crypto.randomBytes(15).toString('hex').substring(0, 15);
          const result = await placeOrder({
            marketId,
            side,
            size: hedge.size,
            price,
            selectionId,
            customerStrategyRef,
            unmatchedBets,
            matchedBets,
          });
          if (result.bets) updateOrders(result.bets);
        }
      },
      [backList, fillOrKillList, layList, matchedBets, stopEntryList, stopLossList, tickOffsetList, unmatchedBets],
    );

    const handlePlaceOrder = useCallback(
      async (side, price, marketId, selectionId, stopLossSelected, isStopLossActive, hedgeSize) => {
        const customerStrategyRef = crypto.randomBytes(15).toString('hex').substring(0, 15);
        const size = customStake || stakeVal;
        //* Place the order first with BetFair and then execute the tools
        const betId = await placeOrder({
          marketId,
          selectionId,
          side,
          size,
          price: formatPrice(price),
          customerStrategyRef,
        });
        //* betId only returned if the bet was success
        if (betId) {
          if (stopLossSelected && !isStopLossActive) {
            const SL = {
              strategy: 'Stop Loss',
              marketId,
              selectionId,
              size,
              side: getOppositeSide(side),
              price: calcStopLossPrice(price, stopLossOffset, side),
              custom: false,
              units: stopLossUnits,
              ticks: stopLossOffset,
              rfs: customerStrategyRef,
              assignedIsOrderMatched: false,
              betId,
              hedged: stopLossHedged,
            };
            addStopLoss(SL);
            saveBet(SL);
          } else if (tickOffsetSelected) {
            const TOS = {
              strategy: 'Tick Offset',
              marketId,
              selectionId,
              size: tickOffsetHedged ? hedgeSize : size,
              side: getOppositeSide(side),
              price: calcTickOffsetPrice(price, side, tickOffsetTicks, tickOffsetUnits === 'Percent'),
              percentageTrigger: tickOffsetTrigger,
              rfs: customerStrategyRef,
              betId,
              hedged: tickOffsetHedged,
            };
            addTickOffset(TOS);
            saveBet(TOS);
          }

          if (fillOrKillSelected) {
            const FOK = {
              strategy: 'Fill Or Kill',
              marketId,
              selectionId,
              side,
              seconds: fillOrKillSeconds,
              startTime: Date.now(),
              betId,
              rfs: customerStrategyRef,
            };
            addFillOrKill(FOK);
            saveBet(FOK);
          }
        }
      },
      [customStake, stakeVal, tickOffsetSelected, fillOrKillSelected, stopLossOffset, stopLossUnits, stopLossHedged, tickOffsetTicks, tickOffsetUnits, tickOffsetHedged, tickOffsetTrigger, fillOrKillSeconds],
    );

    return (
      <Container isReferenceSet={isReferenceSet} order={order} containerRef={containerRef} isMoving={isMoving} isLadderDown={isLadderDown} setIsReferenceSet={setReferenceSent} setIsMoving={setIsMoving} setLadderDown={setLadderDown}>
        <Header selectionId={selectionId} setLadderDown={setLadderDown} hedge={ltpHedge} />

        <div
          className={clsx(classes.ladder, {
            [classes.expanded]: expanded,
          })}
          onContextMenu={() => false}
          onPointerOver={onHoverLadder}
          onPointerLeave={overLeaveLadder}
        >
          <PercentageRow setLadderSideLeft={setLadderSideLeft} selectionId={selectionId} />
          <AutoSizer>
            {({ height, width }) => (
              <List
                className={classes.List}
                height={height}
                itemCount={ALL_PRICES.length}
                itemSize={20}
                width={width}
                ref={listRef}
                style={ladderStyle}
                itemData={{
                  selectionId,
                  handlePlaceOrder,
                  handleHedgeCellClick,
                  isMoving,
                  hedgingAvailable,
                }}
              >
                {LadderRow}
              </List>
            )}
          </AutoSizer>
        </div>
        <PriceRow selectionId={selectionId} />
        <BottomPanel selectionId={selectionId} />
        {/* <OrderRow selectionId={selectionId} /> */}
      </Container>
    );
  },
  isMoving,
);

const mapStateToProps = (state, { selectionId }) => ({
  ltp: getLTP(state.market.ladder, { selectionId }),
  expanded: state.market.ladder[selectionId].expanded,
  selectionMatchedBets: getSelectionMatchedBets(state.order.bets, { selectionId }),
  unmatchedBets: getUnmatchedBets(state.order.bets),
  matchedBets: getMatchedBets(state.order.bets),
  stakeVal: getStakeVal(state.settings.stake, { selectionId }),
  customStake: state.market.runners[selectionId].order.customStake,
  draggingLadder: state.ladder.draggingLadder,

  //* Back/Lay
  layList: state.lay.list,
  backList: state.back.list,

  //* SL
  stopLossList: state.stopLoss.list,
  stopLossOffset: state.stopLoss.offset,
  stopLossSelected: state.stopLoss.selected,
  stopLossUnits: state.stopLoss.units,
  stopLossHedged: state.stopLoss.hedged,

  //* TO
  tickOffsetList: state.tickOffset.list,
  tickOffsetSelected: state.tickOffset.selected,
  tickOffsetTicks: state.tickOffset.ticks,
  tickOffsetUnits: state.tickOffset.units,
  tickOffsetTrigger: state.tickOffset.percentTrigger,
  tickOffsetHedged: state.tickOffset.hedged,

  //* FOK
  fillOrKillSelected: state.fillOrKill.selected,
  fillOrKillSeconds: state.fillOrKill.seconds,
  fillOrKillList: state.fillOrKill.list,

  //* SE
  stopEntryList: state.stopEntry.list,
});

const mapDispatchToProps = {
  placeOrder,
  updateOrders,
  updateBackList,
  updateLayList,
  addStopLoss,
  updateStopLossList,
  addTickOffset,
  updateTickOffsetList,
  addFillOrKill,
  updateFillOrKillList,
  updateStopEntryList,
};

export default connect(mapStateToProps, mapDispatchToProps)(Ladder);
