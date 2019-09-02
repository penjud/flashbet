const initialState = {
    stake: 2,
    price: 750,
    fillOrKill: false,
    stopLoss: false,
    tickOffset: false,
    offset: {
        hours: 0,
        minutes: 0,
        seconds: 0
    },
    executionTime: "Before"
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case "SET_BACK_STAKE":
            return { ...state, stake: action.payload };
        case "SET_BACK_PRICE":
            return { ...state, price: action.payload };
        case "TOGGLE_BACK_FILL_OR_KILL":
            return { ...state, fillOrKill: action.payload };
        case "TOGGLE_BACK_STOP_LOSS":
            return { ...state, stopLoss: action.payload };
        case "TOGGLE_BACK_TICK_OFFSET":
            return { ...state, tickOffset: action.payload };
        case "SET_BACK_HOURS":
        return { ...state, offset: { hours: action.payload, minutes: state.offset.minutes, seconds: state.offset.seconds } };
        case "SET_BACK_MINUTES":
            return { ...state, offset: { hours: state.offset.hours, minutes: action.payload, seconds: state.offset.seconds } };
        case "SET_BACK_SECONDS":
            return { ...state, offset: { hours: state.offset.hours, minutes: state.offset.minutes, seconds: action.payload } };
        case "TOGGLE_BACK_EXECUTION_BEFORE_OR_AFTER":
            return { ...state, executionTime: action.payload };
        default:
            return state;
    }
};

export default reducer;