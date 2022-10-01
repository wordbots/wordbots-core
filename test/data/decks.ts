import { constant, times } from 'lodash';

import defaultCollectionState from '../../src/common/store/defaultCollectionState';
import * as w from '../../src/common/types';
import { instantiateCard } from '../../src/common/util/cards';
import { unpackDeck } from '../../src/common/util/decks';

import { attackBotCard, cantripCard, instantKernelKillerAbilityCard } from './cards';

export function constantDeck(card: w.CardInStore, deckSize = 30): w.DeckInGame {
  return {
    id: card.id,
    authorId: '',
    name: card.id,
    cardIds: times(deckSize, constant('dummyId')),
    cards: times(deckSize, constant(card)).map(instantiateCard),
    setId: null
  };
}

export const defaultDecks: w.DeckInGame[] = (
  defaultCollectionState.decks.map((d: w.DeckInStore) => unpackDeck(d, defaultCollectionState.cards, []))
);

export const emptyDeck: w.DeckInGame = { id: '', authorId: '', name: '', cardIds: [], cards: [], setId: null };

export const botsOnlyDeck: w.DeckInGame = constantDeck(attackBotCard);
export const eventsOnlyDeck: w.DeckInGame = constantDeck(cantripCard);
export const kernelKillerDeck: w.DeckInGame = constantDeck(instantKernelKillerAbilityCard);
