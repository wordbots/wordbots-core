import { scryRenderedComponentsWithType } from 'react-dom/test-utils';

import { combineState } from '../testHelpers';
import { createCollection, renderElement } from '../reactHelpers';
import CardGrid from '../../src/common/components/cards/CardGrid';
import CardTable from '../../src/common/components/cards/CardTable';
import FilterControls from '../../src/common/components/cards/FilterControls';
import LayoutControls from '../../src/common/components/cards/LayoutControls';
import SearchControls from '../../src/common/components/cards/SearchControls';
import collectionReducer from '../../src/common/reducers/collection';
import creatorReducer from '../../src/common/reducers/creator';
import gameReducer from '../../src/common/reducers/game';
import { collection as cards } from '../../src/common/store/cards';

describe('Collection container', () => {
  const CARDS_IN_PAGE = 20;
  const DEFAULT_COST_MAX = 20;

  it('should be able to open the card collection and use the sidebar controls', () => {
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

    const collection = renderElement(createCollection(state, dispatch), true);

    function component(componentClass) {
      const components = scryRenderedComponentsWithType(collection, componentClass);
      return (components && components.length === 1) ? components[0] : null;
    }

    // Layout controls

    expect(component(CardGrid).props.cards.length).toEqual(CARDS_IN_PAGE);
    expect(component(CardTable)).toBeNull();

    component(LayoutControls).props.onSetLayout(1);

    expect(component(CardGrid)).toBeNull();
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
});
