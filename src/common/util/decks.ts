import { compact, orderBy, shuffle } from 'lodash';

import { KEEP_DECKS_UNSHUFFLED } from '../constants';
import * as w from '../types';

import { instantiateCard } from './cards';

/** Given a DeckInStore, a user's pool of cards, and a list of sets,
  * return an array of the (unshuffled) cards in the deck. */
export function cardsInDeck(deck: w.DeckInStore, userCards: w.CardInStore[], sets: w.Set[]): w.CardInStore[] {
  const set: w.Set | null = deck.setId && sets.find((s) => s.id === deck.setId) || null;
  const cardPool = set ? set.cards : userCards;
  return compact((deck.cardIds || []).map((id) =>
    (id.startsWith('builtin/') ? userCards : cardPool).find((c) => c.id === id))
  );
}

/** Given a DeckInStore, a user's pool of cards, and a list of sets,
  * return a shuffled array of the cards in the deck. */
export function shuffleCardsInDeck(deck: w.DeckInStore, userCards: w.CardInStore[], sets: w.Set[]): w.CardInGame[] {
  const unshuffledCards = cardsInDeck(deck, userCards, sets);
  const potentiallyShuffledCards = KEEP_DECKS_UNSHUFFLED ? unshuffledCards : shuffle(unshuffledCards);
  return potentiallyShuffledCards.map(instantiateCard);
}

/** Given a DeckInStore, returns an "unpacked" DeckInGame so that it can be used in a game.
  * i.e. materializes the cards in the deck: { cardIds } => { cardIds, cards } */
export function unpackDeck(deck: w.DeckInStore, userCards: w.CardInStore[], sets: w.Set[]): w.DeckInGame {
  return { ...deck, cards: shuffleCardsInDeck(deck, userCards, sets) };
}

/** Returns whether the given DeckInStore is built-in (i.e., not user-created). */
export function deckIsBuiltin(deck: w.DeckInStore): boolean {
  return deck.id[0] === '[';
}

/** Sorts an array of decks, by timestamp descending (last-used timestamp if exists, otherwise
  * last-modified timestamp) for user decks, followed by built-in decks.
  * Note: this method is parameterized because it needs to support both DeckInStore and DeckInGame. */
export function sortDecks<D extends w.DeckInStore>(decks: D[]): D[] {
  return orderBy(decks, (deck: D) => (
    deck.lastUsedTimestamp || deck.timestamp || (deckIsBuiltin(deck) ? 0 : 1)
  ), ['desc']);
}
