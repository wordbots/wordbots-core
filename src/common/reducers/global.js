import * as ga from '../actions/global';
import { GAME_START } from '../actions/socket';
import defaultState from '../store/defaultGlobalState';

export default function global(state = defaultState, action) {
  switch (action.type) {
    case ga.FIREBASE_DATA:
      if (action.payload.data.dictionary) {
        return Object.assign(state, {dictionary: Object.assign(state.dictionary, action.payload.data.dictionary)});
      } else {
        return state;
      }

    case ga.LOGGED_IN:
      return Object.assign(state, {user: action.payload.user});

    case ga.LOGGED_OUT:
      return Object.assign(state, {user: null});

    case ga.TOGGLE_SIDEBAR:
      return Object.assign(state, {sidebarOpen: action.payload.value});

    case GAME_START:
      return Object.assign(state, {sidebarOpen: true});  // Always open sidebar when a game starts.

    default:
      return state;
  }
}
