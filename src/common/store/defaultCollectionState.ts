import * as w from '../types';

import { collection } from './cards';
import * as decks from './decks';

const defaultCollectionState: w.CollectionState = {
  cards: collection,
  decks: [
    {
      id: '[default-aggro]',
      authorId: '[built-in]',
      name: 'RoboRampage (Built-in)',
      cardIds: decks.aggro.map((c) => c.id),
      setId: null
    },
    {
      id: '[default-healing]',
      authorId: '[built-in]',
      name: 'Deft Defense (Built-in)',
      cardIds: decks.healing.map((c) => c.id),
      setId: null
    }
  ],
  sets: [],
  allCards: collection,
  deckBeingEdited: null,
  setBeingEdited: null,
  exportedJson: null
};

export default defaultCollectionState;
