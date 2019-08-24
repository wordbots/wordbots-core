import { scryRenderedComponentsWithType } from 'react-dom/test-utils';
import RaisedButton from 'material-ui/RaisedButton';
import { cloneDeep } from 'lodash';

import { combineState } from '../testHelpers.ts';
import { createHome, renderElement } from '../reactHelpers';

describe('Home container', () => {
  let state, dispatch, home;

  function component(componentClass) {
    const components = scryRenderedComponentsWithType(home, componentClass);
    return (components && components.length === 1) ? components[0] : components;
  }

  beforeEach(() => {
    const dispatchedActions = [];

    state = cloneDeep(combineState());
    home = renderElement(createHome(state), true).props.children;
  });

  it('should be able to click each button on the homepage', () => {
    console.log(home);

    component(RaisedButton)
      .find(b => b.props.label === 'Delete Selected')
      .props.onClick();

  });
});
