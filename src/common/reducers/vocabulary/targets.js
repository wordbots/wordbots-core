// Targets are all functions that return an array,
// either of player objects
// or of [hex, object] pairs representing objects on board.

export default function targets(state) {
  return {
    self: function () {
      return [state.players[state.currentTurn]];
    },

    all: function (collection) {
      return _.toPairs(collection);
    }
  };
}
