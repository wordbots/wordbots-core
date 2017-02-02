// Targets are all functions that return an array,
// either of player objects
// or of [hex, object] pairs representing objects on board.

export default function targets(state) {
  return {
    all: function (collection) {
      return _.toPairs(collection);
    },

    // TODO choose(collection) -- requires choice

    // TODO thisRobot() -- requires triggers

    self: function () {
      return [state.players[state.currentTurn]];
    }

    // TODO opponent()

    // TODO allPlayers()
  };
}
