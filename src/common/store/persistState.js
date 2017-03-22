const CURRENT_VERSION = 2;  // Increase whenever localStorage schema has a breaking change.

export function loadState(state) {
  if (typeof localStorage !== 'undefined' && localStorage['wb$version']) {
    const savedVersion = parseInt(localStorage['wb$version']);
    if (savedVersion === CURRENT_VERSION) {
      const savedCollection = JSON.parse(localStorage['wb$collection']);

      if (savedCollection) {
        state.collection.cards = savedCollection;

        // In the future we will persist all decks. For now we just have a "Default" deck of most recent cards.
        state.collection.decks = [{
          id: '[default]',
          name: 'Default',
          cards: savedCollection.slice(0, 30)
        }];
      }
    }
  }

  return state;
}

export function saveState(state) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('wb$version', CURRENT_VERSION);
    localStorage.setItem('wb$collection', JSON.stringify(state.collection.cards));
  }
}
