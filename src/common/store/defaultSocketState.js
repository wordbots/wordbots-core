const defaultState = {
  connecting: false,
  connected: false,
  username: null,
  clientId: null,

  hosting: false,
  gameName: null,

  matches: [],
  playersOnline: [],
  waitingPlayers: [],
  clientIdToUsername: {},

  chatMessages: []
};

export default defaultState;
