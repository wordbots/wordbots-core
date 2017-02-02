import { stringToType } from '../../constants';
import { allObjectsOnBoard } from '../handlers/game/util';

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
