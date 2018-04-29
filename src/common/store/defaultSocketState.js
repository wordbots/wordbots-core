const defaultState = {
  connecting: false,
  connected: false,
  clientId: null,

  hosting: false,
  gameName: null,
  queuing: false,
  inQueue: 0,

  games: [],
  playersOnline: [],
  waitingPlayers: [],
  clientIdToUsername: {},

  chatMessages: []
};

export default defaultState;
