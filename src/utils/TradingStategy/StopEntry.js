const stopEntryCheck = async (currentLTP, stopEntryArray, onPlaceOrder) => {

    let indexesToRemove = [];
    let ordersToRemove = [];

    // eslint-disable-next-line no-loop-func
    stopEntryArray.map((item, index) => {
        if ((currentLTP < item.targetLTP && item.stopEntryCondition == '<' ) || (currentLTP == item.targetLTP && item.stopEntryCondition == '=' ) || (currentLTP > item.targetLTP && item.stopEntryCondition == '>' )) {
            onPlaceOrder(item);
            
            indexesToRemove = indexesToRemove.concat(index);
            ordersToRemove = ordersToRemove.concat(item);
          }  
        
    })

    if (ordersToRemove.length > 0) {
        await fetch('/api/remove-orders', {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify(ordersToRemove)
        })
    }


    return indexesToRemove;
}

export { stopEntryCheck };