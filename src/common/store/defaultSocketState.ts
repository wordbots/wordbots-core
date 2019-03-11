import * as w from '../types';

const defaultState: w.SocketState = {
  connecting: false,
  connected: false,
  clientId: null,

  hosting: false,
  gameName: null,
  queuing: false,
  queueSize: 0,

  games: [],
  playersOnline: [],
  waitingPlayers: [],
  userDataByClientId: {},

  chatMessages: []
};

export default defaultState;
