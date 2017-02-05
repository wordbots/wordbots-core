import { stringToType } from '../../constants';
import { allObjectsOnBoard } from '../handlers/game/util';

// A collection is a function that returns either an array of cards in a players' hand
// or an array of [hex, object] pairs representing object on the board.

export function cardsInHand(state) {
  return function (players) {
    const player = players[0]; // Player target is always in the form of list, so just unpack it.
    return player.hand;
  };
}

export function objectsInPlay(state) {
  return function (objType) {
    return _.pickBy(allObjectsOnBoard(state), (obj, hex) =>
      obj.card.type == stringToType(objType)
    );
  };
}

export function objectsMatchingCondition(state) {
  return function (objType, condition) {
    return _.pickBy(allObjectsOnBoard(state), (obj, hex) =>
      obj.card.type == stringToType(objType) && condition(hex, obj)
    );
  };
}
