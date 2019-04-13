import { combineReducers, Reducer } from 'redux';

import * as w from '../types';

import collection from './collection';
import creator from './creator';
import game from './game';
import global from './global';
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

export default rootReducer;  // tslint:disable-line export-name
