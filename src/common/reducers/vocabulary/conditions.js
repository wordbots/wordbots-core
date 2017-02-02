// Conditions are all (hex, obj) -> bool functions.

export default function conditions(state) {
  return {
    controlledBy: function (players) {
      return function (hex, obj) {
        return _.has(players[0].robotsOnBoard, hex);
      };
    }
  };
}
