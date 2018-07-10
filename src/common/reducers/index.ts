import { combineReducers, Reducer } from 'redux';

import * as w from '../types';

import global from './global';
import game from './game';
import creator from './creator';
import collection from './collection';
import socket from './socket';
import version from './version';

const rootReducer: Reducer<w.State, any> = combineReducers({
  global,
  game,
  creator,
  collection,
  socket,
  version
});

export default rootReducer;
