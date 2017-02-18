import { getHex, getAttribute } from '../util';
import Hex from '../components/react-hexgrid/Hex';
import HexUtils from '../components/react-hexgrid/HexUtils';

// Conditions are all (hex, obj) -> bool functions.
// They are used by the objectsMatchingConditions() collection.

export default function conditions(state) {
  return {
    adjacentTo: function (objects) {
      const neighbors = _.flatMap(objects, targetObj => {
        const targetHex = HexUtils.IDToHex(getHex(state, targetObj));

        return [
          new Hex(targetHex.q, targetHex.r - 1, targetHex.s + 1),
          new Hex(targetHex.q, targetHex.r + 1, targetHex.s - 1),
          new Hex(targetHex.q - 1, targetHex.r + 1, targetHex.s),
          new Hex(targetHex.q + 1, targetHex.r - 1, targetHex.s),
          new Hex(targetHex.q - 1, targetHex.r, targetHex.s + 1),
          new Hex(targetHex.q + 1, targetHex.r, targetHex.s - 1)
        ];
      }).map(HexUtils.getID);

      return ((hex, obj) => neighbors.includes(hex));
    },

    attributeComparison: function (attr, comp) {
      return ((hex, obj) => comp(getAttribute(obj, attr)));
    },

    controlledBy: function (players) {
      const player = players[0]; // Player target is always in the form of list, so just unpack it.
      return ((hex, obj) => _.has(player.robotsOnBoard, hex));
    }
  };
}
