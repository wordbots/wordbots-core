import { combineReducers } from 'redux';
import { routerStateReducer } from 'redux-router';
import undoable from 'redux-undo';

import game from './game';
import user from './user';
import layout from './layout';
import version from './version';

const rootReducer = combineReducers({
  game: game,
  user: user,
  version: version,
  layout: undoable(layout),
  router: routerStateReducer
});

export default rootReducer;
