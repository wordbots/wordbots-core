import { combineReducers } from 'redux';
import { routerStateReducer } from 'redux-router';
import undoable from 'redux-undo';

import game from './game';
import user from './user';
import layout from './layout';
import version from './version';
import cardCreator from './cardCreator';

const rootReducer = combineReducers({
  game: game,
  cardCreator: cardCreator,
  user: user,
  version: version,
  layout: undoable(layout),
  router: routerStateReducer
});

export default rootReducer;
