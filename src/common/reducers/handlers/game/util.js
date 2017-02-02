import { vocabulary } from '../../vocabulary/vocabulary';

export function currentPlayer(state) {
  return state.players[state.currentTurn];
}

export function opponentPlayer(state) {
  return state.players[opponentName(state)];
}

export function opponentName(state) {
  return (state.currentTurn == 'blue') ? 'orange' : 'blue';
}

export function allObjectsOnBoard(state) {
  return Object.assign({}, state.players.blue.robotsOnBoard, state.players.orange.robotsOnBoard);
}

export function executeCmd(state, cmd) {
  /* eslint-disable no-unused-vars */
  const actions = vocabulary.actions(state);
  const targets = vocabulary.targets(state);
  const conditions = vocabulary.conditions(state);
  const objectsMatchingCondition = vocabulary.objectsMatchingCondition(state);
  /* eslint-enable no-unused-vars */

  eval(cmd)();
  return state;
}
