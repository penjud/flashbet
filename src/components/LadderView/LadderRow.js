import React from 'react'
import LadderOrderCell from './LadderOrderCell'
import { formatPrice } from "../../utils/ladder/CreateFullLadder";
import { findStopPosition, findStopPositionForPercent } from "../../utils/TradingStategy/StopLoss";
import crypto from 'crypto'

export default ({data: { ladder, selectionId, placeOrder, ltp, ltpList, stopLoss, changeStopLossList, hedgeSize, setOddsHovered }, style, index}) => {
    const key = Object.keys(ladder)[index]
    const indexInLTPList = ltpList.findIndex(item => item.tick == key);
    return (
        <div key={ladder[key].odds}  onContextMenu = { (e) => { e.preventDefault(); return false } } class = 'tr' style = {style} >
          <div className={"candle-stick-col td"} colSpan={3}  >
            {
              indexInLTPList >= 0 ? 
              <img 
                src={`${window.location.origin}/icons/${ltpList[indexInLTPList].color === 'R' ? 'red-candle.png' : 'green-candle.png'}`} 
                className={"candle-stick"} alt = "" style = {{right: indexInLTPList * 2}} /> 
              : null
            }
            
          </div>
          <div 
            className = 'td'
            style = {{color: `${ladder[key].backProfit >= 0 ? "green" : 'red'}`}}
            onClick = {() => {
              const referenceStrategyId = crypto.randomBytes(15).toString('hex').substring(0, 15)

              placeOrder({
                side: "BACK",
                price: formatPrice(ladder[key].odds),
                selectionId: selectionId,
                customerStrategyRef: referenceStrategyId,
                size: hedgeSize + parseFloat(ladder[key].backProfit)
              })
            }}
          >{ladder[key].backProfit}</div>
          <LadderOrderCell 
            side = {"BACK"}
            cell = {ladder[key]}
            selectionId = {selectionId}
            placeOrder = {placeOrder}
            isStopLoss = {stopLoss !== undefined && stopLoss.side == "BACK" ? 
                          stopLoss.units == "Ticks" ? findStopPosition(stopLoss.price, stopLoss.tickOffset, stopLoss.side.toLowerCase()) === key :
                          findStopPositionForPercent(stopLoss.size, stopLoss.price, stopLoss.tickOffset, stopLoss.side.toLowerCase()) === key
                           : false}
            stopLossData = {stopLoss}
            changeStopLossList= {changeStopLossList}
            hedgeSize = {hedgeSize}
            onHover = {() => setOddsHovered({odds: ladder[key].odds, side: "BACK"})}
            onLeave = {() => setOddsHovered({odds: 0, side: "BACK"})}
          />
          <div style = {{
            background: key == ltp ? 'yellow' : '#BBBBBB'
          }} className = 'td'>{formatPrice(ladder[key].odds)}</div>
          <LadderOrderCell 
            side = {"LAY"}
            cell = {ladder[key]}
            selectionId = {selectionId}
            placeOrder = {placeOrder} 
            isStopLoss = {stopLoss !== undefined && stopLoss.side == "LAY" ? 
              stopLoss.units == "Ticks" ? findStopPosition(stopLoss.price, stopLoss.tickOffset, stopLoss.side.toLowerCase()) === key :
              findStopPositionForPercent(stopLoss.size, stopLoss.price, stopLoss.tickOffset, stopLoss.side.toLowerCase()) === key
               : false}
            stopLossData = {stopLoss}
            changeStopLossList= {changeStopLossList}
            hedgeSize = {hedgeSize}
            onHover = {() => setOddsHovered({odds: ladder[key].odds, side: "LAY"})}
            onLeave = {() => setOddsHovered({odds: 0, side: "LAY"})}
          />
          <div 
            className = 'td'
            style = {{color: `${ladder[key].layProfit >= 0 ? "green" : 'red'}`}}
            onClick = {() => {
              const referenceStrategyId = crypto.randomBytes(15).toString('hex').substring(0, 15)

              placeOrder({
                side: "LAY",
                price: formatPrice(ladder[key].odds),
                selectionId: selectionId,
                customerStrategyRef: referenceStrategyId,
                size: hedgeSize + parseFloat(ladder[key].layProfit)
              })
            }}
          >{ladder[key].layProfit}</div>
        </div>
    )
}