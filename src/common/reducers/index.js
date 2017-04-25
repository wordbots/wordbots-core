import { combineReducers } from 'redux';
import undoable from 'redux-undo';

import game from './game';
import creator from './creator';
import collection from './collection';
import socket from './socket';
import layout from './layout';
import version from './version';
// import router from './router';

const rootReducer = combineReducers({
  game: game,
  creator: creator,
  collection: collection,
  socket: socket,
  version: version,
  layout: undoable(layout)
});

export default rootReducer;
