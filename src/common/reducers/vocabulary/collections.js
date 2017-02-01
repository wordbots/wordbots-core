import { pickBy } from 'lodash'
import { stringToType } from '../../constants'
import { allObjectsOnBoard } from '../handlers/game/util'

export function objectsMatchingCondition(state) {
  return function (objType, condition) {
    console.log(allObjectsOnBoard(state));
    return _.pickBy(allObjectsOnBoard(state), (obj, hex) =>
      obj.card.type == stringToType(objType) && condition(hex, obj)
    );
  }
}
