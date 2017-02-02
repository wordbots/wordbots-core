import { currentPlayer, opponentPlayer } from '../handlers/game/util';

// Targets are all functions that return an array,
// either of player objects, or of card objects,
// or of [hex, object] pairs representing objects on board.

export default function targets(state) {
  return {
    all: function (collection) {
      return _.toPairs(collection);
    },

    // TODO choose(collection) -- requires choice

    // TODO thisRobot() -- requires triggers

    self: function () {
      return [currentPlayer(state)];
    },

    opponent: function () {
      return [opponentPlayer(state)];
    },

    allPlayers: function () {
      return [currentPlayer(state), opponentPlayer(state)];
    }
  };
}
