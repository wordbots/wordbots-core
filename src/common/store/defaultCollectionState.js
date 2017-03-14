import { collection } from './cards';

const defaultState = {
  cards: collection,
  decks: [
    {
      name: 'Default',
      cards: collection.slice(0, 30)
    }
  ]
};

export default defaultState;
