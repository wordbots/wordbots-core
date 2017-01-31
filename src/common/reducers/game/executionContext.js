// Executes a command in the context of a game state.
export default class ExecutionContext {
  constructor(state) {
    this.state = state;
  }

  execute(cmd) {
    let state = this.state;

    // TODO: Move these to separate files.
    const actions = {
      draw: function (player, count) {
        player.hand = player.hand.concat(player.deck.splice(0, count));
      }
    };
    const targets = {
      self: function () {
        return state.players[state.currentTurn];
      }
    }

    eval(cmd)();

    return state;
  }
}
