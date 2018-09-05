import { constant, noop, times } from 'lodash';

import { instantKernelKillerAbilityCard } from './cards';
import * as w from '../../src/common/types';
import { instantiateCard, unpackDeck } from '../../src/common/util/cards';
import defaultCollectionState from '../../src/common/store/defaultCollectionState';
import * as m from '../../src/server/multiplayer/multiplayer';

export const defaultDecks: m.Deck[] = (
  defaultCollectionState.decks.map((d: w.DeckInStore) => unpackDeck(d, defaultCollectionState.cards))
);

export const emptyDeck: m.Deck = {id: '', name: '', cardIds: [], cards: []};

export const kernelKillerDeck: m.Deck = {
  id: 'kernelKillerDeckId',
  name: 'kernelKillerDeckName',
  cardIds: times(30, constant('dummyId')),
  cards: times(30, constant(instantKernelKillerAbilityCard)).map(instantiateCard)
};
