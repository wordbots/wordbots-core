// Targets are all functions that return an array,
// either of player objects or of robotOnBoard objects.

export default function targets(state) {
  return {
    self: function () {
      return [state.players[state.currentTurn]];
    },

    all: function (collection) {
      return Object.values(collection);
    }
  };
}
