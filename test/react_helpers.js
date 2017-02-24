import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';

import { Game, mapStateToProps, mapDispatchToProps } from '../src/common/containers/Game';
import Board from '../src/common/components/game/Board';

export function renderElement(elt, deep = false) {
  if (deep) {
    return ReactTestUtils.renderIntoDocument(elt);
  } else {
    const renderer = ReactTestUtils.createRenderer();
    renderer.render(elt);
    return renderer.getRenderOutput();
  }
}

export function getComponent(componentClass, state, dispatch = () => {}, predicate = () => {}) {
  const game = renderElement(createGame(state, dispatch), true);
  const components = ReactTestUtils.scryRenderedComponentsWithType(game, componentClass);
  return (components.length == 1) ? components[0] : components.find(predicate);
}

/* eslint-disable react/no-multi-comp */

export function createGame(state, dispatch = () => {}) {
  return React.createElement(Game, Object.assign(mapStateToProps(state), mapDispatchToProps(dispatch)));
}

export function createBoard(state) {
  const game = createGame(state);
  return (
    <Board
      selectedTile={game.props.selectedTile}
      target={game.props.target}
      bluePieces={game.props.bluePieces}
      orangePieces={game.props.orangePieces}
      currentTurn={game.props.currentTurn}
      playingCardType={game.props.playingCardType}
      onSelectTile={game.onSelectTile}
      onHoverTile={game.onHoverTile} />
  );
}

/* eslint-enable react/no-multi-comp */
