import vocabulary from '../../vocabulary/vocabulary';

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

export function updateOrDeleteObjectAtHex(state, object, hex) {
  if (state.players.blue.robotsOnBoard[hex]) {
    if (object.stats.health > 0) {
      state.players.blue.robotsOnBoard[hex] = object;
    } else {
      delete state.players.blue.robotsOnBoard[hex];

      // Check victory conditions.
      if (object.card.name === 'Blue Core') {
        state.winner = 'orange';
      }
    }
  } else if (state.players.orange.robotsOnBoard[hex]) {
    if (object.stats.health > 0) {
      state.players.orange.robotsOnBoard[hex] = object;
    } else {
      delete state.players.orange.robotsOnBoard[hex];

      // Check victory conditions.
      if (object.card.name === 'Orange Core') {
        state.winner = 'blue';
      }
    }
  }
}

/* eslint-disable no-unused-vars */
export function executeCmd(state, cmd) {
  const actions = vocabulary.actions(state);
  const targets = vocabulary.targets(state);
  const conditions = vocabulary.conditions(state);

  // Global methods
  const cardsInHand = vocabulary.cardsInHand(state);
  const objectsInPlay = vocabulary.objectsInPlay(state);
  const objectsMatchingCondition = vocabulary.objectsMatchingCondition(state);

  eval(cmd)();
  return state;
}
/* eslint-enable no-unused-vars */
