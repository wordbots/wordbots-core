import { orderBy } from 'lodash';

import * as w from '../types';

export function sortDecks(decks: w.DeckInStore[]): w.DeckInStore[] {
  const decksWithTimestamps = decks.map((deck): w.DeckInStore => {
    if (deck.timestamp) {
      return deck;                      // Deck has a timestamp
    } else if (deck.id[0] === '[') {
      return { ...deck, timestamp: 0 }; // Deck is built-in
    } else {
      return { ...deck, timestamp: 1 }; // Deck is user-created, but doesn't have a timestamp
    }
  });
  return orderBy(decksWithTimestamps, ['timestamp'], ['desc']);
}
