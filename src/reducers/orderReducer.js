import { omit } from 'lodash'

const initialState = {
  bets: {
    matched: {},
    unmatched: {},
  },
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_BET':
      return { ...state, bets: action.payload };
    case 'ADD_UNMATCHED_BET':
      return {
        ...state,
        bets: {
          ...state.bets,
          unmatched: {
            ...state.bets.unmatched,
            [action.payload.betId]: {
              ...action.payload,
            },
          },
        },
      };
    case 'UPDATE_SIZE_MATCHED':
      return {
        ...state,
        bets: {
          ...state.bets,
          unmatched: {
            ...state.bets.unmatched,
            [action.payload.betId]: {
              ...state.bets.unmatched[action.payload.betId],
              sizeMatched: action.payload.sizeMatched,
              sizeRemaining: action.payload.sizeRemaining,
            },
          },
        },
      };
    case 'UPDATE_BET_EXECUTION_COMPLETE':
      return {
        ...state,
        bets: {
          ...state.bets,
          matched: {
            ...state.bets.matched,
            [action.payload.betId]: {
              ...state.bets.unmatched[action.payload.betId],
              sizeMatched: action.payload.sizeMatched,
              sizeRemaining: action.payload.sizeRemaining,
            },
          },
          unmatched: omit(state.bets.unmatched, action.payload.betId),
        },
      };
    default:
      return state;
  }
};

export default reducer;
