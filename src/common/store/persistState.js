const CURRENT_VERSION = 8;  // Increase whenever localStorage schema has a breaking change.

export function loadState(state) {
  if (typeof localStorage !== 'undefined' && localStorage['wb$version']) {
    const savedVersion = parseInt(localStorage['wb$version']);
    if (savedVersion === CURRENT_VERSION) {
      state.socket.username = localStorage['wb$username'];
      state.collection.cards = JSON.parse(localStorage['wb$collection']);
      state.collection.decks = JSON.parse(localStorage['wb$decks']);
    }
  }

  return state;
}

export function saveState(state) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('wb$version', CURRENT_VERSION);
    localStorage.setItem('wb$username', state.socket.username);
    localStorage.setItem('wb$collection', JSON.stringify(state.collection.cards));
    localStorage.setItem('wb$decks', JSON.stringify(state.collection.decks));
  }
}
