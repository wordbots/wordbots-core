import { flatMap, has, isString } from 'lodash';

import { getHex, getAttribute, getAdjacentHexes } from '../util/game';
import HexUtils from '../components/react-hexgrid/HexUtils';

// Conditions are all (hex, obj) -> bool functions.
// They are used by the objectsMatchingConditions() collection.

export default function conditions(state) {
  return {
    adjacentTo: function (hexesOrObjects) {
      const neighborHexIds = flatMap(hexesOrObjects, hexOrObj =>
        getAdjacentHexes(HexUtils.IDToHex(isString(hexOrObj) ? hexOrObj : getHex(state, hexOrObj)))
      ).map(HexUtils.getID);

      return ((hex, obj) => neighborHexIds.includes(hex));
    },

    attributeComparison: function (attr, comp) {
      return ((hex, obj) => comp(getAttribute(obj, attr)));
    },

    controlledBy: function (players) {
      const player = players[0]; // Player target is always in the form of list, so just unpack it.
      return ((hex, obj) => has(player.robotsOnBoard, hex));
    }
  };
}
