import defaultState from '../store/defaultCollectionState';
import * as cardCreatorActions from '../actions/cardCreator';
import { createCardFromProps } from '../util';

export default function collection(oldState = defaultState, action) {
  const state = Object.assign({}, oldState);

  switch (action.type) {
    case cardCreatorActions.ADD_TO_COLLECTION: {
      const card = createCardFromProps(action.payload);
      state.cards.unshift(card);
      return state;
    }

    default:
      return state;
  }
}
