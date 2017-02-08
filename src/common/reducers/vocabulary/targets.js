import { currentPlayer, opponentPlayer } from '../handlers/game/util';

// Targets are all functions that return an array,
// either of player objects, or of card objects,
// or of [hex, object] pairs representing objects on board.

export default function targets(state, currentObject) {
  return {
    all: function (collection) {
      return _.toPairs(collection);
    },

    // TODO Also handle the case when collection is an array of cards (rather than objects).
    choose: function (collection) {
      if (state.target.chosen) {
        return state.target.chosen;
      } else {
        state.target.choosing = true;
        state.target.possibleHexes = Object.keys(collection);
        return [];
      }
    },

    thisRobot: function () {
      return [[null, currentObject]];  // TODO pass the current hex as well.
    },

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
