export function loadState(state) {
  if (typeof localStorage !== 'undefined' && localStorage.collection) {
    const savedCollection = JSON.parse(localStorage.collection);

    if (savedCollection) {
      state.collection.cards = savedCollection;

      // In the future we will persist all decks. For now we just have a "Default" deck of most recent cards.
      state.collection.decks = [{
        name: 'Default',
        cards: savedCollection.slice(0, 30)
      }];
    }
  }

  return state;
}

export function saveState(store) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('collection', JSON.stringify(store.getState().collection.cards));
  }
}
