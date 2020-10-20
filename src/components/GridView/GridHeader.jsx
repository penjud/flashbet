import React from 'react';
import { connect } from 'react-redux';
import crypto from 'crypto';
import { sumMatchedBets } from '../../utils/Bets/BettingCalculations';
import { getOrderBtnBG } from '../../utils/ColorManipulator';
import { getHedgedBetsToMake } from '../../utils/TradingStategy/HedingCalculator';
import { formatTotalMatched } from '../../utils/NumberFormat';
import { renderRaceStatus } from './RaceStatus';

const GridHeader = ({
  marketId,
  ladder,
  marketOpen,
  marketName,
  marketStartTime,
  event,
  inPlay,
  marketStatus,
  country,
  oneClickRef,
  oneClickOn,
  toggleOneClick,
  oneClickStake,
  setStakeOneClick,
  stakeBtns,
  layBtns,
  bets,
  ltpList,
  onPlaceOrder,
  marketCashout,
}) => {
  const executeMarketCashout = () => () => {
    const hedgedBets = getHedgedBetsToMake(marketId, bets, ltpList);

    if (hedgedBets.length > 0) {
      const recursivePlaceHedge = (index, unmatchedBets) => {
        const referenceStrategyId = crypto.randomBytes(15).toString('hex').substring(0, 15);

        onPlaceOrder({
          marketId,
          side: hedgedBets[index].side,
          size: hedgedBets[index].stake,
          price: hedgedBets[index].buyPrice,
          selectionId: hedgedBets[index].selectionId,
          customerStrategyRef: referenceStrategyId,
          unmatchedBets,
          matchedBets: bets.matched,
          orderCompleteCallBack: (betId, newUnmatchedBets) => recursivePlaceHedge(index + 1, newUnmatchedBets),
        });
      };
      recursivePlaceHedge(0, bets.unmatched);
    }
  };

  return (
    <>
      <tr id="grid-header">
        <th colSpan="11">
          <button type="button" id="one-click-btn" ref={oneClickRef} onClick={toggleOneClick()}>
            {`Turn One click ${oneClickOn ? 'off' : 'on'}`}
          </button>
          <h1>
            {marketOpen
              ? `${new Date(marketStartTime).toLocaleTimeString(navigator.language, {
                hour: '2-digit',
                minute: '2-digit',
              })} ${marketName} ${event.venue || ''}`
              : 'No Event Selected'}
          </h1>
          {oneClickOn ? (
            <>
              <div id="one-click-stake">
                <button type="button">Stake</button>
                {stakeBtns.map((stake) => (
                  <button type="button" style={{ background: getOrderBtnBG('STAKE', stake, oneClickStake, -70) }} onClick={setStakeOneClick(stake)}>
                    {stake}
                  </button>
                ))}
              </div>
              <br />
              <div id="one-click-liability">
                <button type="button">Liability</button>
                {layBtns.map((stake) => (
                  <button type="button" style={{ background: getOrderBtnBG('LAY', stake, oneClickStake, -70) }} onClick={setStakeOneClick(stake)}>
                    {stake}
                  </button>
                ))}
              </div>
            </>
          ) : null}
          {renderRaceStatus(marketOpen, marketStatus, inPlay)}
          <span id="matched-bets">{marketOpen ? `Matched: ${formatTotalMatched(country.localeCode, country.currencyCode, sumMatchedBets(ladder))}` : null}</span>
        </th>
      </tr>
      <tr id="grid-subheader">
        {/* The Cash out figure simply adds all current profit and losses together
            If you click it, then it should place N bets (or how ever many you need)
            to close those positions/
        */}
        <th id="market-cashout">
          <span>Market Cashout</span>
          <span style={{ color: marketCashout < 0 ? 'red' : marketCashout > 0 ? '#01CC41' : '#D3D3D3' }} onClick={executeMarketCashout()}>
            {marketCashout}
          </span>
        </th>
        <th colSpan="2" />
        <th />
        <th />
        <th>
          <span>Back</span>
        </th>
        <th>
          <span>Lay</span>
        </th>
        <th />
        <th />
        <th />
        <th />
      </tr>
    </>
  );
};

const mapStateToProps = (state) => ({
  inPlay: state.market.inPlay,
  marketId: state.market.marketId,
  marketName: state.market.marketName,
  marketStartTime: state.market.marketStartTime,
  marketStatus: state.market.status,
  event: state.market.event,
});

export default connect(mapStateToProps)(GridHeader);
