// Conditions are all (hex, obj) -> bool functions.

export default function conditions(state) {
  return {
    // TODO adjacentTo(objects) -- may be hard without triggers

    // TODO attributeComparison(attr, comp)

    controlledBy: function (players) {
      return function (hex, obj) {
        return _.has(players[0].robotsOnBoard, hex);
      };
    }
  };
}
