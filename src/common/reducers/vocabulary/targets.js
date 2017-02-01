export default function targets(state) {
  return {
    self: function () {
      return state.players[state.currentTurn];
    }
  };
}
