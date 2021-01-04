import { noop } from 'lodash';
import { getMuiTheme, MuiThemeProvider } from 'material-ui/styles';
import * as React from 'react';
import { findRenderedComponentWithType, renderIntoDocument, scryRenderedComponentsWithType } from 'react-dom/test-utils';
import { createRenderer } from 'react-test-renderer/shallow';

import * as coll from '../src/common/containers/Collection.tsx';
import * as creator from '../src/common/containers/Creator.tsx';
import * as gameArea from '../src/common/containers/GameAreaContainer.tsx';
import wordbotsTheme from '../src/common/themes/muiV0';

export function renderElement(elt, deep = false, unwrap = true) {
  if (deep) {
    // TODO this wrapping/unwrapping may not be necessary anymore once our theming moves to MUI v1 (which provides a default theme)
    const wrappedElt = (
      <MuiThemeProvider muiTheme={getMuiTheme(wordbotsTheme)}>
        {elt}
      </MuiThemeProvider>
    );
    const rendered = renderIntoDocument(wrappedElt);
    return unwrap ? findRenderedComponentWithType(rendered, elt.type) : rendered;
  } else {
    const renderer = createRenderer();
    renderer.render(elt);
    return renderer.getRenderOutput();
  }
}

/* eslint-disable react/no-multi-comp */

export function createGameArea(state, dispatch = noop, props = {}) {
  return React.createElement(gameArea.GameAreaContainer, { ...gameArea.mapStateToProps(state), ...gameArea.mapDispatchToProps(dispatch), ...props});
}

function createCreator(state, dispatch = noop) {
  return React.createElement(creator.Creator, { ...creator.mapStateToProps(state), ...creator.mapDispatchToProps(dispatch), history: { push: noop } });
}

export function createCollection(state, dispatch = noop) {
  return React.createElement(coll.Collection, { ...coll.mapStateToProps(state), ...coll.mapDispatchToProps(dispatch) });
}

/* eslint-enable react/no-multi-comp */

export function getComponent(type, componentClass, state, dispatch = noop, predicate = noop) {
  const elt = renderElement(instantiator(type)(state, dispatch), true, false);
  const components = scryRenderedComponentsWithType(elt, componentClass);
  return (components.length === 1) ? components[0] : components.find(predicate);
}

function instantiator(type) {
  return {
    'GameArea': createGameArea,
    'Creator': createCreator,
    'Collection': createCollection
  }[type];
}
