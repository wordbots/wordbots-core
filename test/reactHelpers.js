import React from 'react';
import { renderIntoDocument, scryRenderedComponentsWithType } from 'react-dom/test-utils';
import { createRenderer } from 'react-test-renderer/shallow';
import injectTapEventPlugin from 'react-tap-event-plugin';

import * as creator from '../src/common/containers/Creator';
import * as play from '../src/common/containers/Play';

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

export function createGame(state, dispatch = () => {}) {
  return React.createElement(play.Play, Object.assign(play.mapStateToProps(state), play.mapDispatchToProps(dispatch)));
}

function createCreator(state, dispatch = () => {}) {
  return React.createElement(creator.Creator, Object.assign(creator.mapStateToProps(state), creator.mapDispatchToProps(dispatch)));
}

/* eslint-enable react/no-multi-comp */

export function getComponent(type, componentClass, state, dispatch = () => {}, predicate = () => {}) {
  const playElt = renderElement(instantiator(type)(state, dispatch), true);
  const components = scryRenderedComponentsWithType(playElt, componentClass);
  return (components.length === 1) ? components[0] : components.find(predicate);
}

function instantiator(type) {
  return {
    'Play': createGame,
    'Creator': createCreator
  }[type];
}
