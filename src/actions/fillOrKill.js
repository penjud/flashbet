export const setFillOrKill = seconds => {
    return {
        type: "SET_FILL_OR_KILL_TIME",
        payload: seconds
    }
};

export const setDisplayText = text => {
    return {
        type: "SET_FILL_OR_KILL_TEXT",
        payload: text
    }
};