import { constant, times } from 'lodash';

import { attackBotCard, cantripCard, instantKernelKillerAbilityCard } from './cards';
import * as w from '../../src/common/types';
import { instantiateCard, unpackDeck } from '../../src/common/util/cards';
import defaultCollectionState from '../../src/common/store/defaultCollectionState';

export function constantDeck(card: w.CardInStore, deckSize: number = 30): w.Deck {
  return {
    id: card.id,
    name: card.id,
    cardIds: times(deckSize, constant('dummyId')),
    cards: times(deckSize, constant(card)).map(instantiateCard),
    setId: null
  };
}

export const defaultDecks: w.Deck[] = (
  defaultCollectionState.decks.map((d: w.DeckInStore) => unpackDeck(d, defaultCollectionState.cards))
);

export const emptyDeck: w.Deck = {id: '', name: '', cardIds: [], cards: [], setId: null};

export const botsOnlyDeck: w.Deck = constantDeck(attackBotCard);
export const eventsOnlyDeck: w.Deck = constantDeck(cantripCard);
export const kernelKillerDeck: w.Deck = constantDeck(instantKernelKillerAbilityCard);
