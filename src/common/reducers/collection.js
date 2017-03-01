import defaultState from '../store/defaultCollectionState';
import * as creatorActions from '../actions/creator';
import { createCardFromProps } from '../util';

export default function collection(oldState = defaultState, action) {
  const state = Object.assign({}, oldState);

  switch (action.type) {
    case creatorActions.ADD_TO_COLLECTION: {
      const card = createCardFromProps(action.payload);
      state.cards.unshift(card);
      return state;
    }

    default:
      return state;
  }
}
