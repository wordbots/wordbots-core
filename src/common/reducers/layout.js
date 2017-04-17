import { TOGGLE_SIDEBAR } from '../actions/layout';
import { GAME_START } from '../actions/socket';

export default function layout(state = {sidebarOpen: true}, action) {
  switch (action.type) {
    case TOGGLE_SIDEBAR:
      return {sidebarOpen: action.value};

    case GAME_START:
      return {sidebarOpen: true};  // Always open sidebar when a game starts.

    default:
      return state;
  }
}
