import React from 'react';
import { renderIntoDocument, scryRenderedComponentsWithType } from 'react-dom/test-utils';
import { createRenderer } from 'react-test-renderer/shallow';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { noop } from 'lodash';

import * as coll from '../src/common/containers/Collection';
import * as creator from '../src/common/containers/Creator';
import * as gameArea from '../src/common/containers/GameArea';

injectTapEventPlugin();

export function renderElement(elt, deep = false) {
  if (deep) {
    return renderIntoDocument(elt);
  } else {
    const renderer = createRenderer();
    renderer.render(elt);
    return renderer.getRenderOutput();
  }
}

/* eslint-disable react/no-multi-comp */

export function createGameArea(state, dispatch = noop) {
  return React.createElement(gameArea.GameArea, Object.assign(gameArea.mapStateToProps(state), gameArea.mapDispatchToProps(dispatch)));
}

function createCreator(state, dispatch = noop) {
  return React.createElement(creator.Creator, Object.assign(creator.mapStateToProps(state), creator.mapDispatchToProps(dispatch)));
}

export function createCollection(state, dispatch = noop) {
  return React.createElement(coll.Collection, Object.assign(coll.mapStateToProps(state), coll.mapDispatchToProps(dispatch)));
}

/* eslint-enable react/no-multi-comp */

export function getComponent(type, componentClass, state, dispatch = noop, predicate = noop) {
  const playElt = renderElement(instantiator(type)(state, dispatch), true);
  const components = scryRenderedComponentsWithType(playElt, componentClass);
  return (components.length === 1) ? components[0] : components.find(predicate);
}

function instantiator(type) {
  return {
    'GameArea': createGameArea,
    'Creator': createCreator,
    'Collection': createCollection
  }[type];
}
