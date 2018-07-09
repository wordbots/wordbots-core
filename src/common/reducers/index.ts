import { combineReducers, Reducer } from 'redux';

import * as w from '../types';

import global from './global';
import game from './game';
import creator from './creator';
import collection from './collection';
import socket from './socket';
import version from './version';

const globalReducer: Reducer<w.GlobalState, any> = global;
const gameReducer: Reducer<w.GameState, any> = game;
const creatorReducer: Reducer<w.CreatorState, any> = creator;
const collectionReducer: Reducer<w.CollectionState, any> = collection;
const socketReducer: Reducer<w.SocketState, any> = socket;
const versionReducer: Reducer<number, any> = version;

const rootReducer: Reducer<w.State, any> = combineReducers({
  global: globalReducer,
  game: gameReducer,
  creator: creatorReducer,
  collection: collectionReducer,
  socket: socketReducer,
  version: versionReducer
});

export default rootReducer;
