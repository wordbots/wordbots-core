import { compact, find, isString, random } from 'lodash';

import { collection as builtinCards } from './cards';

// Increase CURRENT_VERSION whenever localStorage schema has a breaking change.
// (DANGER - use this sparingly, as it clears all localStorage.)
const CURRENT_VERSION = 8;

function canLoadState() {
  if (typeof localStorage !== 'undefined' && localStorage['wb$version']) {
    const savedVersion = parseInt(localStorage['wb$version']);
    if (savedVersion === CURRENT_VERSION) {
      return true;
    } else {
      localStorage[`wb$backup.v${savedVersion}`] = JSON.stringify(localStorage);
      return false;
    }
  } else {
    return false;
  }
}

export function saveToLocalStorage(key, value) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('wb$version', CURRENT_VERSION);
    localStorage.setItem(`wb$${key}`, isString(value) ? value : JSON.stringify(value));
  }
}

export function loadUsername(socketState) {
  if (socketState) {
    // This check is necessary to avoid errors in server-side rendering.
    socketState.username = `Guest${random(100000,999999)}`;

    if (canLoadState()) {
      const username = localStorage['wb$username'];
      if (username && username !== 'null' && !username.startsWith('Guest')) {
        socketState.username = username;
      }
    }
  }
  return socketState;
}

export function loadCards(collectionState) {
  if (canLoadState()) {
    const cards = localStorage['wb$collection'];
    if (cards) {
      collectionState.cards = builtinCards.concat(compact(JSON.parse(cards)).filter(c => c.source !== 'builtin'));
    }
  }
  return collectionState;
}

export function loadDecks(collectionState) {
  function getNewCopyIfBuiltinCard(card) {
    return (card.source === 'builtin') ? (find(builtinCards, {'name': card.name}) || card) : card;
  }

  if (canLoadState()) {
    const decks = localStorage['wb$decks'];
    if (decks) {
      collectionState.decks = JSON.parse(decks).map(deck =>
        Object.assign({}, deck, {cards: compact(deck.cards).map(getNewCopyIfBuiltinCard)})
      );
    }
  }
  return collectionState;
}
