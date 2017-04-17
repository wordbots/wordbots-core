import { collection } from './cards';

const defaultState = {
  cards: collection,
  decks: [
    {
      id: '[default]',
      name: 'Default',
      cards: collection.slice(0, 30)
    }
  ],
  exportedJson: null
};

export default defaultState;
