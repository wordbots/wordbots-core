import * as w from '../types';

const defaultSocketState: w.SocketState = {
  connecting: false,
  connected: false,
  clientId: null,

  hosting: false,
  gameName: null,
  queuing: false,
  queueSize: 0,

  games: [],
  playersOnline: [],
  playersInLobby: [],
  waitingPlayers: [],
  userDataByClientId: {},

  chatMessages: []
};

export default defaultSocketState;
