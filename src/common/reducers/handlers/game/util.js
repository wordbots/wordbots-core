import { TYPE_CORE } from '../../../constants';
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

export function dealDamageToObjectAtHex(state, amount, hex) {
  const object = allObjectsOnBoard(state)[hex];
  object.stats.health -= amount;
  return updateOrDeleteObjectAtHex(state, object, hex);
}

function updateOrDeleteObjectAtHex(state, object, hex) {
  const ownerName = (state.players.blue.robotsOnBoard[hex]) ? 'blue' : 'orange';

  if (object.stats.health > 0) {
    state.players[ownerName].robotsOnBoard[hex] = object;
  } else {
    delete state.players[ownerName].robotsOnBoard[hex];

    // Check victory conditions.
    if (object.card.type === TYPE_CORE) {
      state.winner = (ownerName == 'blue') ? 'orange' : 'blue';
    }
  }

  return state;
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
