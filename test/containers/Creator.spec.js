import { combineState } from '../testHelpers.ts';
import { getComponent } from '../reactHelpers';
import CardCreationForm from '../../src/common/components/cards/CardCreationForm.tsx';
import collectionReducer from '../../src/common/reducers/collection.ts';
import creatorReducer from '../../src/common/reducers/creator.ts';
import gameReducer from '../../src/common/reducers/game.ts';

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
        global: state.global
      };
    }

    function form() {
      return getComponent('Creator', CardCreationForm, state, dispatch).props;
    }

    const numCards = state.collection.cards.length;
    const newCardName = 'Test Card';

    // While we're here, test the ability to open Help and Dictionary dialogs.
    form().onOpenDialog('help');
    form().onOpenDialog('dictionary');

    form().onSetName(newCardName);

    expect(state.creator.name).toEqual(newCardName);

    form().onAddToCollection();

    expect(state.collection.cards.length).toEqual(numCards + 1);

    // TODO test other functionality of the card creator.
  });
});
