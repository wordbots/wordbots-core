import { renderElement, getComponent, createCreator } from '../reactHelpers';
import CardCreationForm from '../../src/common/components/cards/CardCreationForm';
import collectionReducer from '../../src/common/reducers/collection';
import creatorReducer from '../../src/common/reducers/creator';
import gameReducer from '../../src/common/reducers/game';
import defaultCollectionState from '../../src/common/store/defaultCollectionState';
import defaultCreatorState from '../../src/common/store/defaultCreatorState';
import defaultGameState from '../../src/common/store/defaultGameState';

describe('Creator container', () => {
  it('should be able to create cards', () => {
    const dispatchedActions = [];
    let state = {
      collection: defaultCollectionState,
      creator: defaultCreatorState,
      game: defaultGameState
    };

    function dispatch(action) {
      // console.log(action);
      dispatchedActions.push(action);
      console.log(action);
      state = {  // Mimic the behavior of the combined reducers.
        collection: collectionReducer(state.collection, action),
        creator: creatorReducer(state.creator, action),
        game: gameReducer(state.game, action)
      };g
    }

    getComponent('Creator', CardCreationForm, state, dispatch).props
      .onSetName('Test Card');

  });
});
