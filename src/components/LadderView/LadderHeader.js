import React from "react";
import { iconForEvent } from "../../utils/Market/EventIcons";
import { calcBackBet } from "../../utils/TradingStategy/HedingCalculator";
import { getTrainerAndJockey } from "../../utils/Market/GetTrainerAndJockey";

export default ({ selectionId, sportId, runner, runnerClick, setLadderDown, PL, ladderLTPHedge, newStake, oddsHovered, ordersOnMarket }) => {

  const oddsHoveredCalc = ((oddsHovered.side == "BACK" && oddsHovered.selectionId === selectionId) || (oddsHovered.side == "LAY" && oddsHovered.selectionId !== selectionId) ? 1 : -1) * parseFloat(calcBackBet(oddsHovered.odds, 2) +
    ((oddsHovered.side == "BACK" && oddsHovered.selectionId === selectionId) || (oddsHovered.side == "LAY" && oddsHovered.selectionId !== selectionId) ? 1 : -1) * parseFloat(PL)).toFixed(2);

  const handleMouseDown = () => e => {
    setLadderDown(true);
  };

  const handleNoImageError = () => e => {
    e.target.onerror = null;
    e.target.src = iconForEvent(parseInt(sportId));
  };

  return (
    <div className={"ladder-header"}>
      <div>
        <h2 className="contender-name"
          onMouseDown={handleMouseDown()}
        >
          {
            <img
              className={"contender-image"}
              src={
                runner.metadata.COLOURS_FILENAME && parseInt(sportId) === 7
                  ? `https://content-cache.cdnbf.net/feeds_images/Horses/SilkColours/${runner.metadata.COLOURS_FILENAME}`
                  : iconForEvent(sportId)
              }
              alt={"Colours"}
              onClick={runnerClick}
              onError={handleNoImageError()}
            />
          }
          {`${
            runner.metadata.CLOTH_NUMBER ? runner.metadata.CLOTH_NUMBER + ". " : ""
            }${runner.runnerName}`}
        </h2>
        <div className="contender-odds-container">
          <span className="contender-odds"
            style={{
              visibility: ordersOnMarket ? 'visible' : 'hidden',
              color: PL > 0 ? 'rgb(106, 177, 79)' : 'red'
            }}
          >{"£" + Math.abs(PL)}</span>
          <div className={"contender-details"}>
            <span>{getTrainerAndJockey(runner.metadata)}</span>
          </div>
          <span className="contender-odds"
            style={{
              visibility: oddsHovered.odds > 0 && ordersOnMarket ? 'visible' : 'hidden',
              color: oddsHoveredCalc > 0 ? 'rgb(106, 177, 79)' : 'red'
            }}>
            {"£" + Math.abs(oddsHoveredCalc)}
          </span>
        </div>
      </div>
      <div>
        <span style={{ visibility: ladderLTPHedge === 0 ? 'hidden' : 'visible', color: parseFloat(ladderLTPHedge).toFixed(2) > 0 ? 'rgb(106, 177, 79)' : 'red' }}>
          {"£" + parseFloat(Math.abs(parseFloat(ladderLTPHedge))).toFixed(2)}
        </span>
        <span style={{ visibility: newStake === 0 ? 'hidden' : 'visible', color: parseFloat(newStake).toFixed(2) > 0 ? 'rgb(106, 177, 79)' : 'red' }}>
          {"£" + parseFloat(Math.abs(parseFloat(newStake))).toFixed(2)}
        </span>
      </div>
    </div>
  )
};