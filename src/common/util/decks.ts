import { orderBy } from 'lodash';

import * as w from '../types';

// TODO Move more methods from cards.ts to decks.ts

// Note: this method is parametrized because it needs to support both Deck and DeckInStore.
// eslint-disable-next-line  
export function sortDecks<T extends w.DeckInStore>(decks: T[]): T[] {
  const decksWithTimestamps: T[] = decks.map((deck: T) => {
    if (deck.timestamp) {
      return deck;                      // Deck has a timestamp
    } else if (deck.id[0] === '[') {
      return { ...(deck as w.DeckInStore), timestamp: 0 } as T; // Deck is built-in
    } else {
      return { ...(deck as w.DeckInStore), timestamp: 1 } as T; // Deck is user-created, but doesn't have a timestamp
    }
  });
  return orderBy(decksWithTimestamps, ['timestamp'], ['desc']);
}
