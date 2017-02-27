import { combineReducers } from 'redux';
import { routerStateReducer } from 'redux-router';
import undoable from 'redux-undo';

import game from './game';
import cardCreator from './cardCreator';
import collection from './collection';
import user from './user';
import layout from './layout';
import version from './version';

const rootReducer = combineReducers({
  game: game,
  cardCreator: cardCreator,
  collection: collection,
  user: user,
  version: version,
  layout: undoable(layout),
  router: routerStateReducer
});

export default rootReducer;
