import { isString, without } from 'lodash';

import { ActionTypeWithin } from '../types';

import * as game from './game';
import * as socket from './socket';

/** Like isString, but with a more precise type guard in its signature. */
const isStringTyped = <T>(val: T): val is Extract<T, string> => isString(val);

/** Given an actions/* module export T, return just the action type strings, discarding the action implementations. */
const allActionTypes = <T>(exports: T): Array<ActionTypeWithin<T>> => (
  Object.values(exports).filter<ActionTypeWithin<T>>(isStringTyped)
);

/** Game and socket action types that are *ignored* by the websocket middleware and not passed along the ws connection. */
const EXCLUDED_ACTION_TYPES: Array<ActionTypeWithin<typeof game> | ActionTypeWithin<typeof socket>> = [
  // game.END_GAME,  // we actually pass along the END_GAME action now, purely for tracking whether a player is still in a singleplayer game
  game.SET_VOLUME,  // purely client-side
  // the socket connection doesn't care about what happens in single-player modes:
  game.AI_RESPONSE,
  game.TUTORIAL_STEP,
  // the socket connection tracks connection state on its own:
  socket.CONNECTING,
  socket.CONNECTED,
  socket.DISCONNECTED
];

/** The array of action types that the websocket middleware passes along the websocket connection. */
// eslint-disable-next-line import/prefer-default-export
export const SOCKET_ACTION_TYPES: Array<ActionTypeWithin<typeof game> | ActionTypeWithin<typeof socket>> = without(
  [...allActionTypes(game), ...allActionTypes(socket)],
  ...EXCLUDED_ACTION_TYPES
);
