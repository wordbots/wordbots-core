import * as ga from '../actions/global';
import defaultState from '../store/defaultGlobalState';
import * as w from '../types';

export default function global(state: w.GlobalState = defaultState, action: w.Action): w.GlobalState {
  switch (action.type) {
    case ga.FIREBASE_DATA:
      if (action.payload.data && action.payload.data.dictionary) {
        return {...state, dictionary: {...state.dictionary, ...action.payload.data.dictionary}};
      } else {
        return state;
      }

    case ga.LOGGED_IN:
      return {...state, user: action.payload.user};

    case ga.LOGGED_OUT:
      return {...state, user: null};

    case ga.RE_RENDER:
      return {...state, renderId: state.renderId + 1};

    default:
      return state;
  }
}
