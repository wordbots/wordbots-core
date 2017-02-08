import Hex from '../components/react-hexgrid/Hex';
import HexUtils from '../components/react-hexgrid/HexUtils';

// Conditions are all (hex, obj) -> bool functions.

export default function conditions(state) {
  return {
    adjacentTo: function (objects) {
      if (objects.length > 0) {
        // Hex target is always in the form of list of (hex, obj) pairs, so just unpack it.
        const hex = HexUtils.IDToHex(objects[0][0]);

        const neighbors = [
          new Hex(hex.q, hex.r - 1, hex.s + 1),
          new Hex(hex.q, hex.r + 1, hex.s - 1),
          new Hex(hex.q - 1, hex.r + 1, hex.s),
          new Hex(hex.q + 1, hex.r - 1, hex.s),
          new Hex(hex.q - 1, hex.r, hex.s + 1),
          new Hex(hex.q + 1, hex.r, hex.s - 1)
        ].map(HexUtils.getID);

        return function (candidateHexID, obj) {
          return neighbors.includes(candidateHexID);
        };
      } else {
        // objects is empty, so nothing is adjacent - return false for all candidates.
        return function () { return false; };
      }
    },

    attributeComparison: function (attr, comp) {
      return function (hex, obj) {
        return comp(obj.stats[attr]);
      };
    },

    controlledBy: function (players) {
      const player = players[0]; // Player target is always in the form of list, so just unpack it.
      return function (hex, obj) {
        return _.has(player.robotsOnBoard, hex);
      };
    }
  };
}
