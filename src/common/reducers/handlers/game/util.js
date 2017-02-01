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

export function executeCmd(state, cmd) {
  const actions = vocabulary.actions(state);
  const targets = vocabulary.targets(state);

  eval(cmd)();
  return state;
}
