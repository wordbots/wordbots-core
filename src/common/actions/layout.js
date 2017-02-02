import { ActionCreators } from 'redux-undo';

import { GET_USER, getUser} from './user';

export const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR';

export function undo() {
  return (dispatch, getState) => {
    dispatch(ActionCreators.undo());
  };
}

export function redo() {
  return (dispatch, getState) => {
    dispatch(ActionCreators.redo());
  };
}

/**
* Bundle User into layout
*/

export { getUser as getUser };
export { GET_USER as GET_USER };
