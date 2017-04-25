import { newGame, startTurn, endTurn } from '../../../util/game';

export const startNewGame = newGame;

export function passTurn(state, player) {
  if (state.currentTurn === player) {
    return startTurn(endTurn(state));
  } else {
    return state;
  }
}
