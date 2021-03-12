export const setMarketName = (marketName) => ({
  type: 'SET_MARKET_NAME',
  payload: marketName,
});

export const setMarketStartTime = (marketStartTime) => ({
  type: 'SET_MARKET_START_TIME',
  payload: marketStartTime,
});

export const setInPlay = (inPlay) => ({
  type: 'SET_IN_PLAY',
  payload: inPlay,
});

export const setInPlayTime = (time) => ({
  type: 'SET_IN_PLAY_TIME',
  payload: time,
});

export const setPastEventTime = () => ({
  type: 'SET_PAST_EVENT_TIME',
  payload: true,
});

export const setMarketStatus = (status) => ({
  type: 'NEW_MARKET_STATUS',
  payload: status,
});

export const setMarketDescription = (description) => ({
  type: 'SET_MARKET_DESCRIPTION',
  payload: description,
});

export const closeMarket = () => ({
  type: 'CLOSE_MARKET',
  payload: false,
});

export const setMarketId = (marketId) => ({
  type: 'SET_MARKET_ID',
  payload: marketId,
});

export const setEvent = (event) => ({
  type: 'SET_EVENT',
  payload: event,
});

export const setEventType = (eventType) => ({
  type: 'SET_EVENT_TYPE',
  payload: eventType,
});

export const loadLadder = (ladder) => ({
  type: 'LOAD_LADDER',
  payload: ladder,
});

export const setSortedLadder = (sortedLadder) => ({
  type: 'SET_SORTED_LADDER',
  payload: sortedLadder,
});

export const loadRunners = (runners) => ({
  type: 'LOAD_RUNNERS',
  payload: runners,
});

export const loadNonRunners = (nonRunners) => ({
  type: 'LOAD_NON_RUNNERS',
  payload: nonRunners,
});

export const updateExcludedLadders = (ladders) => ({
  type: 'EXCLUDE_LADDERS',
  payload: ladders,
});

export const updateLadderOrder = (orderList) => ({
  type: 'UPDATE_LADDER_ORDER',
  payload: orderList,
});

export const setBackLayColOrder = (layFirstCol) => ({
  type: 'SET_BACK_LAY_COL_LADDER_ORDER',
  payload: layFirstCol,
});

export const setRunner = (runner) => ({
  type: 'SELECT_RUNNER',
  payload: runner,
});

export const toggleOneClick = (active) => ({
  type: 'TOGGLE_ONE_CLICK',
  payload: active,
});

export const updateOrder = (order) => ({
  type: 'UPDATE_ORDER',
  payload: order,
});

export const updateOrderValue = (val) => ({
  type: 'UPDATE_ORDER_VALUE',
  payload: val,
});

export const updateOrderPrice = ({ price, id }) => ({
  type: 'UPDATE_ORDER_PRICE',
  payload: { price, id },
});

export const toggleStakeAndLiability = ({ val, id }) => ({
  type: 'TOGGLE_STAKE_AND_LIABILITY',
  payload: { stakeLiability: val, id },
});

export const toggleBackAndLay = (id) => ({
  type: 'TOGGLE_BACK_AND_LAY',
  payload: { id },
});

export const toggleVisibility = (settings) => ({
  type: 'TOGGLE_ORDER_VISIBILITY',
  payload: settings,
});

export const changePriceType = (priceType) => // stake and liability
  ({
    type: 'SWITCH_PRICE_TYPE',
    payload: priceType,
  });
export const setCustomStakeActive = ({ id, customStakeActive }) => ({
  type: 'UPDATE_CUSTOM_STAKE_ACTIVE',
  payload: { id, customStakeActive },
});

export const setCustomStake = ({ id, customStake }) => ({
  type: 'UPDATE_CUSTOM_STAKE',
  payload: { id, customStake },
});

export const setOddsHovered = (odds) => ({
  type: 'SET_ODDS_HOVERED',
  payload: odds,
});

export const setMarketPL = (pl) => ({
  type: 'SET_MARKET_PL',
  payload: pl,
});

export const setDraggingLadder = (draggingLadder) => ({
  type: 'SET_DRAGGING_LADDER',
  payload: draggingLadder,
});
