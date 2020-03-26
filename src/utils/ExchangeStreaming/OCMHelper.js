/**
 * This function checks if the stoploss's corresponding order is matched.
 * @param {object} stopLossList - The object containing all the stoploss information.
 * @param {object} selectionId - The id that contains the stoploss that will be focused on. 
 * @param {function} order - The current order state with sizeMatched and rfs.
 * @param {object} previousCheckForMatchArray - The object we have to update the value corresponding with the selectionId when the order is matched.
 * @return {object} The new checkForMatchInStopLoss.
 */

export const checkStopLossForMatch = (stopLossList, selectionId, order, previousCheckForMatchArray) => {
    if (stopLossList[selectionId] && stopLossList[selectionId].rfs === order.rfs && order.sr === 0) return true;
    return false;
}


/**
 * This function checks if the tick offset matches the percentage needed.
 * @param {object} tickOffsetList - The object containing all the tickOffset information.
 * @param {object} order - The current order state with sizeMatched and rfs. 
 * @param {function} onPlaceOrder - The function we call when it matches the percentage needed.
 * @param {array} previousTickOffsetOrdersToRemove - The array we have to add the order to when it matches the percentage needed. 
 * @param {object} previousCheckForMatchInTickOffset - The object we have to remove the order from when it reaches the percentage needed.
 * @param {object} unmatchedBets - The unmatchedBets that has to be passed into onPlaceOrder.
 * @param {object} matchedBets - The matchedBets that has to be passed into onPlaceOrder.
 * @return {object} The new {tickOffsetOrdersToRemove, checkForMatchInTickOffset}.
 */
export const checkTickOffsetForMatch = (tickOffsetList, order, onPlaceOrder, previousTickOffsetOrdersToRemove, previousCheckForMatchInTickOffset, unmatchedBets, matchedBets) => {

    // if the strategies are the same and enough of the order has been matched (TICK OFFSET)
    const tickOffsetItem = tickOffsetList[order.selectionId]
    let tickOffsetOrdersToRemove = [...previousTickOffsetOrdersToRemove];
    let checkForMatchInTickOffset = Object.assign({}, previousCheckForMatchInTickOffset);

    if (tickOffsetItem && order.sm / tickOffsetItem.size >= tickOffsetItem.percentageTrigger / 100) {

        onPlaceOrder({
            marketId: tickOffsetItem.marketId,
            selectionId: tickOffsetItem.selectionId,
            side: tickOffsetItem.side,
            size: tickOffsetItem.size,
            price: tickOffsetItem.price, // this is the new price
            unmatchedBets: unmatchedBets,
            matchedBets: matchedBets
        })

        tickOffsetOrdersToRemove = tickOffsetOrdersToRemove.concat(checkForMatchInTickOffset[order.rfs])

        delete checkForMatchInTickOffset[order.rfs];
    }

    return {
        tickOffsetOrdersToRemove: tickOffsetOrdersToRemove,
        checkForMatchInTickOffset: checkForMatchInTickOffset
    }
}