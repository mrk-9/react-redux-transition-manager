import { createSelector } from 'reselect'

// action type
export const TOGGLE_IS_APP_FETCHING = 'TOGGLE_IS_APP_FETCHING'

// action
export function toggleAppFetching (error) {
  return {
    type: TOGGLE_IS_APP_FETCHING,
    payload: error || null,
    error: !!error
  }
}

const intitialState = {
  isAppFetching: false,
  payload: null,
  error: false
}

// reducer
function isAppFetchingReducer (state = intitialState, action) {
  switch (action.type) {
    case TOGGLE_IS_APP_FETCHING:
      return {
        ...intitialState,
        isAppFetching: !state.isAppFetching,
        payload: action.payload || null,
        error: action.error || false
      }
    default:
      return state
  }
}

// selector
const isAppFetchingSelector = (state) => state.isAppFetching

export const getFetching = createSelector(
  isAppFetchingSelector,
  (isAppFetchingState) => isAppFetchingState
)

export default isAppFetchingReducer
