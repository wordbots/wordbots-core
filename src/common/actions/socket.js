// Client => itself

export const CONNECTING = 'ws:CONNECTING';
export const CONNECTED = 'ws:CONNECTED';

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

// Client => server

export const HOST = 'ws:HOST';
export const JOIN = 'ws:JOIN';
export const KEEPALIVE = 'ws:KEEPALIVE';

export function host(name, deck) {
  return {
    type: HOST,
    payload: {
      name: name,
      deck: deck
    }
  };
}

export function join(id, deck) {
  return {
    type: JOIN,
    payload: {
      id: id,
      deck: deck
    }
  };
}

export function keepalive() {
  return {
    type: KEEPALIVE
  };
}

// Server => client

export const INFO = 'ws:INFO';
export const GAME_START = 'ws:GAME_START';
