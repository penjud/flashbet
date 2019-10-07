

/**
 * This function is used to calculate liability of a bet.
 * Source: https://help.smarkets.com/hc/en-gb/articles/115003381865-How-to-calculate-the-liability-of-a-lay-bet
 * @param {string} side - The side i.e. BACK or LAY
 * @param {number} backStake - The stake
 * @param {string} layOdds - Current lay odds
 * @return {number} This amount will be deducted from your balance should your bet lose
 */
const calcLiability = (side, backStake, layOdds) => {
    // When backing an outcome, the liability is your stake
    if (side === 'BACK') return backStake;

    // Calculate the lay liability
    return parseFloat(backStake * (layOdds - 1).toFixed(2));
};

/**
 * This function is used to calculate the amount you need to place the hedged bet for.
 * @param {string} stake - The amount the bet was placed at.
 * @param {number} liability - The amount deducted from the balance if the bet loses.
 * @param {string} exitPrice - The price the bet will be exited at.
 * @return {number} The amount you need to place the bet.
 */
const calcHedgedBetAmount = (stake, liability, exitPrice) => {
    return parseFloat(((stake + liability) / exitPrice).toFixed(2));
};

/**
 * This function is used to calculate the profit/loss from a hedged position.
 * @param {string} stake - The amount the bet was placed at.
 * @param {number} liability - The amount deducted from the balance if the bet loses.
 * @param {string} exitPrice - The price the bet will be exited at.
 * @return {number} The Profit or loss.
 */
const calcHedgedPL = (stake, liability, exitPrice) => {
    return parseFloat((calcHedgedBetAmount(stake, liability, exitPrice) - liability).toFixed(2));
};

export { calcLiability, calcHedgedBetAmount, calcHedgedPL };