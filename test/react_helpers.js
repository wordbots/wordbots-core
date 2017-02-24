import React from 'react';
import Utils from 'react-addons-test-utils';

import { Game, mapStateToProps, mapDispatchToProps } from '../src/common/containers/Game';
import Board from '../src/common/components/game/Board';
import reducer from '../src/common/reducers/game';
import defaultState from '../src/common/store/defaultState';

const dispatchedActions = [];
let currentState = {game: defaultState};

export function refreshGameInstance() {
  return createGame(currentState);
}

function dispatch(action) {
  console.log(action);
  dispatchedActions.push(action);
  currentState = Object.assign({}, currentState, {game: reducer(currentState.game, action)});
}

export function lastDispatch() {
  return dispatchedActions.pop();
}

export function renderElement(elt) {
  const renderer = Utils.createRenderer();
  renderer.render(elt);
  return renderer.getRenderOutput();
}

/* eslint-disable react/no-multi-comp */

export function createGame(state) {
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
