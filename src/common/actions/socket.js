// Client => middleware

export const CONNECT = 'ws:CONNECT';

export function connect() {
  return {
    type: CONNECT
  };
}

// Middleware => client

export const CONNECTING = 'ws:CONNECTING';
export const CONNECTED = 'ws:CONNECTED';
export const DISCONNECTED = 'ws:DISCONNECTED';

export function connecting() {
  return {
    type: CONNECTING
  };
}

export function connected() {
  return {
    type: CONNECTED
  };
}

export function disconnected() {
  return {
    type: DISCONNECTED
  };
}

// Client => server

export const HOST = 'ws:HOST';
export const JOIN = 'ws:JOIN';
export const JOIN_QUEUE = 'ws:JOIN_QUEUE'
export const SPECTATE = 'ws:SPECTATE';
export const LEAVE = 'ws:LEAVE';
export const SET_USERNAME = 'ws:SET_USERNAME';
export const KEEPALIVE = 'ws:KEEPALIVE';

export function host(name, deck) {
  return {
    type: HOST,
    payload: { name, deck }
  };
}

export function join(id, name, deck) {
  return {
    type: JOIN,
    payload: { id, name, deck }
  };
}

export function joinQueue(deck) {
  return {
    type: JOIN_QUEUE,
    payload: {deck}
  };
}

export function spectate(id, name) {
  return {
    type: SPECTATE,
    payload: { id, name }
  };
}

export function leave() {
  return {
    type: LEAVE
  };
}


export function setUsername(username) {
  return {
    type: SET_USERNAME,
    payload: { username }
  };
}

export function keepalive() {
  return {
    type: KEEPALIVE
  };
}

// Client => server => client

export const CHAT = 'ws:CHAT';
export const FORFEIT = 'ws:FORFEIT';

export function chat(msg) {
  return {
    type: CHAT,
    payload: { msg }
  };
}

export function forfeit(winner) {
  return {
    type: FORFEIT,
    payload: { winner }
  };
}

// Server => client

export const INFO = 'ws:INFO';
export const GAME_START = 'ws:GAME_START';
export const CURRENT_STATE = 'ws:CURRENT_STATE';
