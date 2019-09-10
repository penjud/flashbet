const initialState = {
    stake: 2,
    price: 750,
    offset: {
        hours: 0,
        minutes: 0,
        seconds: 0
    },
    executionTime: "Before"
}
initialState.text = `${initialState.stake} @ ${initialState.price}`;

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case "SET_BACK_TEXT":
            return { ...state, text: action.payload };
        case "SET_BACK_STAKE":
            return { ...state, stake: action.payload };
        case "SET_BACK_PRICE":
            return { ...state, price: action.payload };
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