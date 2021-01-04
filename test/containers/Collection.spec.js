import Button from '@material-ui/core/Button';
import { scryRenderedComponentsWithType } from 'react-dom/test-utils';
import { cloneDeep } from 'lodash';

import { combineState } from '../testHelpers.ts';
import { createCollection, renderElement } from '../reactHelpers';
import CardGrid from '../../src/common/components/cards/CardGrid.tsx';
import CardTable from '../../src/common/components/cards/CardTable.tsx';
import FilterControls from '../../src/common/components/cards/FilterControls.tsx';
import LayoutControls from '../../src/common/components/cards/LayoutControls.tsx';
import SearchControls from '../../src/common/components/cards/SearchControls.tsx';
import collectionReducer from '../../src/common/reducers/collection.ts';
import creatorReducer from '../../src/common/reducers/creator.ts';
import gameReducer from '../../src/common/reducers/game.ts';
import { collection as cards } from '../../src/common/store/cards.ts';

describe('Collection container', () => {
  const CARDS_IN_PAGE = 20;
  const DEFAULT_COST_MAX = 20;

  const customCardId = 'customCardId';
  const customCard = {
    metadata: {
      source: { type: 'user' }
    },
    id: customCardId,
    name: 'Custom Card',
    type: 1,
    cost: 1,
    text: ''
  };

  let state, dispatch, collection;

  function component(componentClass) {
    const components = scryRenderedComponentsWithType(collection, componentClass);
    return (components && components.length === 1) ? components[0] : components;
  }

  beforeEach(() => {
    const dispatchedActions = [];

    state = cloneDeep(combineState());
    dispatch = (action) => {
      // console.log(action);
      dispatchedActions.push(action);
      state = {  // Mimic the behavior of the combined reducers.
        collection: collectionReducer(state.collection, action),
        creator: creatorReducer(state.creator, action),
        game: gameReducer(state.game, action),
        global: state.global
      };
    };

    collection = renderElement(createCollection(state, dispatch), true);
  });

  it('should be able to open the card collection', () => {
    expect(component(CardGrid).props.cards.length).toEqual(CARDS_IN_PAGE);
    expect(component(CardTable).length).toEqual(0);
  });

  it('should be able to use the sidebar controls', () => {
    // Layout controls

    expect(component(CardGrid).props.cards.length).toEqual(CARDS_IN_PAGE);
    expect(component(CardTable).length).toEqual(0);

    component(LayoutControls).props.onSetLayout(1);

    expect(component(CardGrid).length).toEqual(0);
    expect(component(CardTable).props.cards.length).toEqual(CARDS_IN_PAGE);

    component(LayoutControls).props.onSetLayout(0);

    // Search controls

    component(SearchControls).props.onChange('One Bot');

    expect(component(CardGrid).props.cards.length).toEqual(1);

    component(SearchControls).props.onChange('');

    expect(component(CardGrid).props.cards.length).toEqual(CARDS_IN_PAGE);

    // Filter controls

    const min = 5, max = 7;
    const numCardsInRange = cards.filter(c => c.cost >= min && c.cost <= max).length;

    component(FilterControls).props.onSetCostRange([min, max]);

    expect(component(CardGrid).props.cards.length).toEqual(numCardsInRange);

    component(FilterControls).props.onSetCostRange([0, DEFAULT_COST_MAX]);
  });

  it('should be able to select custom cards but not built-in cards', () => {
    state.collection.cards.push(customCard);
    collection = renderElement(createCollection(state, dispatch), true);

    component(CardGrid).props.onCardClick(cards[0].id);
    expect(collection.state.selectedCardIds.length).toEqual(0);

    component(CardGrid).props.onCardClick(customCardId);
    expect(collection.state.selectedCardIds.length).toEqual(1);
  });

  it('should be able to remove custom cards from the collection', () => {
    state.collection.cards.push(customCard);
    collection = renderElement(createCollection(state, dispatch), true);

    const numCards = state.collection.cards.length;

    component(CardGrid).props.onCardClick(customCardId);

    component(Button)
      .find(b => b.props.children[1] === 'Delete Selected')
      .props.onClick();

    expect(state.collection.cards.length).toEqual(numCards - 1);
  });

  // TODO Test sort, edit, import/export.
});
