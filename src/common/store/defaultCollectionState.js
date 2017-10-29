import { collection } from './cards';
import * as decks from './decks';

const defaultState = {
  cards: collection,
  decks: [
    {
      id: '[default-aggro]',
      name: 'RoboRampage (Built-in)',
      cardIds: decks.aggro.map(c => c.id)
    },
    {
      id: '[default-healing]',
      name: 'Deft Defense (Built-in)',
      cardIds: decks.healing.map(c => c.id)
    }
  ],
  currentDeck: null,
  exportedJson: null
};

export default defaultState;
