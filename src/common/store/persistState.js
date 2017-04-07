import { find } from 'lodash';

import { collection as builtinCards } from './cards';

// Increase CURRENT_VERSION whenever localStorage schema has a breaking change.
// (DANGER - use this sparingly, as it clears all localStorage.)
const CURRENT_VERSION = 8;

function getNewCopyIfBuiltinCard(card) {
  return (card.source === 'builtin') ? find(builtinCards, {'name': card.name}) : card;
}

export function loadState(state) {
  if (typeof localStorage !== 'undefined' && localStorage['wb$version']) {
    const savedVersion = parseInt(localStorage['wb$version']);
    if (savedVersion === CURRENT_VERSION) {
      state.socket.username = localStorage['wb$username'];

      state.collection.cards = JSON.parse(localStorage['wb$collection']).map(getNewCopyIfBuiltinCard);
      state.collection.decks = JSON.parse(localStorage['wb$decks']).map(deck =>
        Object.assign({}, deck, {cards: deck.cards.map(getNewCopyIfBuiltinCard)})
      );
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
