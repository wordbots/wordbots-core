import {combineReducers} from 'redux';

import gl from './global';
import game from './game';
import creator from './creator';
import collection from './collection';
import socket from './socket';
import version from './version';

const rootReducer = combineReducers({
  global: gl,
  game: game,
  creator: creator,
  collection: collection,
  socket: socket,
  version: version
});

export default rootReducer;
