const defaultState = {
  connecting: false,
  connected: false,
  username: null,
  clientId: null,

  hosting: false,
  gameName: null,

  games: [],
  playersOnline: [],
  waitingPlayers: [],
  clientIdToUsername: {},

  chatMessages: []
};

export default defaultState;
