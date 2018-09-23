import { constant, times } from 'lodash';

import { attackBotCard, cantripCard, instantKernelKillerAbilityCard } from './cards';
import * as w from '../../src/common/types';
import { instantiateCard, unpackDeck } from '../../src/common/util/cards';
import defaultCollectionState from '../../src/common/store/defaultCollectionState';
import * as m from '../../src/server/multiplayer/multiplayer';

function constantDeck(card: m.CardInStore): m.Deck {
  return {
    id: card.id,
    name: card.id,
    cardIds: times(30, constant('dummyId')),
    cards: times(30, constant(card)).map(instantiateCard)
  };
}

export const defaultDecks: m.Deck[] = (
  defaultCollectionState.decks.map((d: w.DeckInStore) => unpackDeck(d, defaultCollectionState.cards))
);

export const emptyDeck: m.Deck = {id: '', name: '', cardIds: [], cards: []};

export const botsOnlyDeck: m.Deck = constantDeck(attackBotCard);
export const eventsOnlyDeck: m.Deck = constantDeck(cantripCard);
export const kernelKillerDeck: m.Deck = constantDeck(instantKernelKillerAbilityCard);
