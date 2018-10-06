import * as w from '../types';
import * as m from '../../server/multiplayer/multiplayer';

// Client => middleware

export const CONNECT = 'ws:CONNECT';

export function connect(): w.Action {
  return {
    type: CONNECT
  };
}

// Middleware => client

export const CONNECTING = 'ws:CONNECTING';
export const CONNECTED = 'ws:CONNECTED';
export const DISCONNECTED = 'ws:DISCONNECTED';

export function connecting(): w.Action {
  return {
    type: CONNECTING
  };
}

export function connected(): w.Action {
  return {
    type: CONNECTED
  };
}

export function disconnected(): w.Action {
  return {
    type: DISCONNECTED
  };
}

// Client => server

export const HOST = 'ws:HOST';
export const CANCEL_HOSTING = 'ws:CANCEL_HOSTING';
export const JOIN = 'ws:JOIN';
export const JOIN_QUEUE = 'ws:JOIN_QUEUE';
export const LEAVE_QUEUE = 'ws:LEAVE_QUEUE';
export const SPECTATE = 'ws:SPECTATE';
export const LEAVE = 'ws:LEAVE';
export const SEND_USER_DATA = 'ws:SEND_USER_DATA';
export const KEEPALIVE = 'ws:KEEPALIVE';

export function host(name: string, format: w.Format, deck: w.Deck, options: w.GameOptions): w.Action {
  return {
    type: HOST,
    payload: { name, format, deck, options }
  };
}

export function cancelHost(): w.Action {
  return {
    type: CANCEL_HOSTING
  };
}

export function join(id: m.ClientID, name: string, deck: w.Deck): w.Action {
  return {
    type: JOIN,
    payload: { id, name, deck }
  };
}

export function joinQueue(format: w.Format, deck: w.Deck): w.Action {
  return {
    type: JOIN_QUEUE,
    payload: { format, deck }
  };
}

export function leaveQueue(): w.Action {
  return {
    type: LEAVE_QUEUE
  };
}

export function spectate(id: m.ClientID, name: string): w.Action {
  return {
    type: SPECTATE,
    payload: { id, name }
  };
}

export function leave(): w.Action {
  return {
    type: LEAVE
  };
}

export function sendUserData(userData: m.UserData): w.Action {
  return {
    type: SEND_USER_DATA,
    payload: { userData }
  };
}

export function keepalive(): w.Action {
  return {
    type: KEEPALIVE
  };
}

// Client => server => client

export const CHAT = 'ws:CHAT';
export const FORFEIT = 'ws:FORFEIT';

export function chat(msg: string): w.Action {
  return {
    type: CHAT,
    payload: { msg }
  };
}

export function forfeit(winner: w.PlayerColor): w.Action {
  return {
    type: FORFEIT,
    payload: { winner }
  };
}

// Server => client

export const CLIENT_ID = 'ws:CLIENT_ID';
export const INFO = 'ws:INFO';
export const GAME_START = 'ws:GAME_START';
export const CURRENT_STATE = 'ws:CURRENT_STATE';
export const REVEAL_CARDS = 'ws:REVEAL_CARDS';
