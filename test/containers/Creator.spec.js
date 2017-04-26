import { combineState } from '../testHelpers';
import { getComponent } from '../reactHelpers';
import CardCreationForm from '../../src/common/components/cards/CardCreationForm';
import collectionReducer from '../../src/common/reducers/collection';
import creatorReducer from '../../src/common/reducers/creator';
import gameReducer from '../../src/common/reducers/game';

describe('Creator container', () => {
  it('should be able to create a simple card and add it to the collection', () => {
    const dispatchedActions = [];
    let state = combineState();

    function dispatch(action) {
      // console.log(action);
      dispatchedActions.push(action);
      state = {  // Mimic the behavior of the combined reducers.
        collection: collectionReducer(state.collection, action),
        creator: creatorReducer(state.creator, action),
        game: gameReducer(state.game, action),
        global: {}
      };
    }

    const numCards = state.collection.cards.length;
    const newCardName = 'Test Card';

    getComponent('Creator', CardCreationForm, state, dispatch).props
      .onSetName(newCardName);

    expect(state.creator.name).toEqual(newCardName);

    getComponent('Creator', CardCreationForm, state, dispatch).props
      .onAddToCollection();

    expect(state.collection.cards.length).toEqual(numCards + 1);

    // TODO test other functionality of the card creator.
  });
});
