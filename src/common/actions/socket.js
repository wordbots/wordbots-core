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
export const CANCEL_HOSTING = 'ws:CANCEL_HOSTING';
export const JOIN = 'ws:JOIN';
export const JOIN_QUEUE = 'ws:JOIN_QUEUE';
export const LEAVE_QUEUE = 'ws:LEAVE_QUEUE';
export const SPECTATE = 'ws:SPECTATE';
export const LEAVE = 'ws:LEAVE';
export const SEND_USER_DATA = 'ws:SEND_USER_DATA';
export const KEEPALIVE = 'ws:KEEPALIVE';

export function host(name, format, deck) {
  return {
    type: HOST,
    payload: { name, format, deck }
  };
}

export function cancelHost() {
  return {
    type: CANCEL_HOSTING
  };
}

export function join(id, name, deck) {
  return {
    type: JOIN,
    payload: { id, name, deck }
  };
}

export function joinQueue(format, deck) {
  return {
    type: JOIN_QUEUE,
    payload: { format, deck }
  };
}

export function leaveQueue() {
  return {
    type: LEAVE_QUEUE
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

export function sendUserData(userData) {
  return {
    type: SEND_USER_DATA,
    payload: { userData }
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
