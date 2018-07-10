import * as ga from '../actions/global';
import defaultState from '../store/defaultGlobalState.ts';

export default function global(state = defaultState, action) {
  switch (action.type) {
    case ga.FIREBASE_DATA:
      if (action.payload.data && action.payload.data.dictionary) {
        return Object.assign(state, {dictionary: Object.assign(state.dictionary, action.payload.data.dictionary)});
      } else {
        return state;
      }

    case ga.LOGGED_IN:
      return Object.assign(state, {user: action.payload.user});

    case ga.LOGGED_OUT:
      return Object.assign(state, {user: null});

    case ga.RE_RENDER:
      return Object.assign(state, {renderId: state.renderId + 1});

    default:
      return state;
  }
}
