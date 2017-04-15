import { find, random } from 'lodash';

import { collection as builtinCards } from './cards';

// Increase CURRENT_VERSION whenever localStorage schema has a breaking change.
// (DANGER - use this sparingly, as it clears all localStorage.)
const CURRENT_VERSION = 8;

function isValidUsername(username) {
  return username && username !== 'null' && !username.startsWith('Guest');
}

function getNewCopyIfBuiltinCard(card) {
  return (card.source === 'builtin') ? (find(builtinCards, {'name': card.name}) || card) : card;
}

export function loadState(state) {
  // Set a default username.
  if (state.socket) {  // This check is necessary to avoid errors in server-side rendering.
    state.socket.username = `Guest${random(100000,999999)}`;
  }

  if (typeof localStorage !== 'undefined' && localStorage['wb$version']) {
    const savedVersion = parseInt(localStorage['wb$version']);
    if (savedVersion === CURRENT_VERSION) {
      const username = localStorage['wb$username'];
      const collection = localStorage['wb$collection'];
      const decks = localStorage['wb$decks'];

      if (isValidUsername(username)) {
        state.socket.username = username;
      }
      state.collection.cards = JSON.parse(collection).map(getNewCopyIfBuiltinCard);

      try {
        state.collection.decks = JSON.parse(decks).map(deck =>
          Object.assign({}, deck, {cards: deck.cards.map(getNewCopyIfBuiltinCard)})
        );
      } catch (e) {
        /* eslint-disable no-console */
        console.log('Couldn\'t import decks:');
        console.log(decks);
        /* eslint-enable no-console */
      }
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
