// Conditions are all (hex, obj) -> bool functions.

export default function conditions(state) {
  return {
    // TODO adjacentTo(objects) -- may be difficult to test without triggers?

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
