import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';

import { Game, mapStateToProps, mapDispatchToProps } from '../src/common/containers/Game';
import Board from '../src/common/components/game/Board';

/* eslint-disable react/no-multi-comp */

export function renderElement(elt) {
  const renderer = ReactTestUtils.createRenderer();
  renderer.render(elt);
  return renderer.getRenderOutput();
}

export function createGame(state) {
  return React.createElement(Game, Object.assign(mapStateToProps(state), mapDispatchToProps()));
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
