const defaultState = {
  connected: false,
  username: null,
  clientId: null,

  hosting: false,
  gameName: null,

  playersOnline: [],
  waitingPlayers: [],
  clientIdToUsername: {},

  chatMessages: []
};

export default defaultState;
