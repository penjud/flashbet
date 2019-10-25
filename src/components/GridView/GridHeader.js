import React from "react";
import { renderRaceStatus } from "./RaceStatus";
import { sumMatchedBets } from "../../utils/PriceCalculator";
import { formatCurrency } from "./../../utils/NumberFormat";
import { getOrderBtnBG } from "../../utils/ColorManipulator";
import getQueryVariable from "../../utils/GetQueryVariable";
import { getMarketCashout } from "../../utils/Bets/GetMarketCashout";
import { getHedgedBetsToMake } from "../../utils/TradingStategy/HedingCalculator";
import { openLiveStream } from "../../utils/Video";
import crypto from 'crypto'

export default ({
  market,
  ladder,
  marketOpen,
  inPlay,
  status,
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
  onPlaceOrder
}) => (
    <React.Fragment>
      <tr id="grid-header">
        <th colSpan="11">
          <button
            id="one-click-btn"
            ref={oneClickRef}
            onClick={toggleOneClick()}
          >
            {`Turn One click ${oneClickOn ? "off" : "on"}`}
          </button>
          <span className={"grid-video"}>
            {" "}
            <img
              src={window.location.origin + "/icons/youtube.png"}
              alt={"Video"}
              onClick={openLiveStream(market)}
            />
          </span>
          <h1>
            {marketOpen
              ? `${new Date(
                market.marketStartTime
              ).toLocaleTimeString()} ${market.marketName} ${
              market.event.venue || ""
              }`
              : "No Event Selected"}
          </h1>
          {oneClickOn ? (
            <React.Fragment>
              <div id="one-click-stake">
                <button>Stake</button>
                {stakeBtns.map(stake => (
                  <button
                    style={{background: getOrderBtnBG("STAKE", stake, oneClickStake, -70)}}
                    onClick={setStakeOneClick(stake)}>
                    {stake}
                  </button>
                ))}
              </div>
              <br />
              <div id="one-click-liability">
                <button>Liability</button>
                {layBtns.map(stake => (
                  <button
                  style={{background: getOrderBtnBG("LAY", stake, oneClickStake, -70)}}
                  onClick={setStakeOneClick(stake)}>
                  {stake}
                </button>
                ))}
              </div>
            </React.Fragment>
          ) : null}
          {renderRaceStatus(marketOpen, status, inPlay)}
          <span id="matched-bets">
            {marketOpen
              ? `Matched: ${formatCurrency(
                country.localeCode,
                country.currencyCode,
                sumMatchedBets(ladder)
              )}`
              : null}
          </span>
        </th>
      </tr>
      <tr id="grid-subheader">
        {/* The Cash out figure simply adds all current profit and losses together
            If you click it, then it should place N bets (or how ever many you need)
            to close those positions/
        */}
        <th>
          <span>Market Cashout</span>
          <span id="market-cashout" onClick = {() => {
              const hedgedBets = getHedgedBetsToMake(getQueryVariable("marketId"), bets, ltpList)

              if (hedgedBets.length > 0) {
                const recursivePlaceHedge = (index, unmatchedBets) => {

                  const referenceStrategyId = crypto.randomBytes(15).toString('hex').substring(0, 15)

                  onPlaceOrder({
                    marketId: market.marketId,
                    side: hedgedBets[index].side,
                    size: hedgedBets[index].stake,
                    price: hedgedBets[index].buyPrice,
                    selectionId: hedgedBets[index].selectionId,
                    customerStrategyRef: referenceStrategyId,
                    unmatchedBets: unmatchedBets,
                    matchedBets: bets.matched,
                    orderCompleteCallBack: (betId, newUnmatchedBets) => recursivePlaceHedge(index + 1, newUnmatchedBets)
                  })
                }

                recursivePlaceHedge(0, bets.unmatched)
                
              }
            }}>{getMarketCashout(getQueryVariable("marketId"), bets)}</span>
        </th>
        <th colSpan="2"></th>
        <th></th>
        <th></th>
        <th>
          <span>Back</span>
        </th>
        <th>
          <span>Lay</span>
        </th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
      </tr>
    </React.Fragment>
  );
