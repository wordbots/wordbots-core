import { bluePlayerState, orangePlayerState } from '../store/defaultGameState';

export function loadState(state) {
  if (typeof localStorage !== 'undefined' && localStorage.collection) {
    const savedCollection = JSON.parse(localStorage.collection);

    if (savedCollection) {
      state.collection.cards = savedCollection;
      state.game.players.blue = bluePlayerState(savedCollection);
      state.game.players.orange = orangePlayerState(savedCollection);
    }
  }

  return state;
}

export function saveState(store) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('collection', JSON.stringify(store.getState().collection.cards));
  }
}
