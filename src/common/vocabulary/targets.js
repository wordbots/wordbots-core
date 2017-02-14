import { currentPlayer, opponentPlayer, ownerOf } from '../util';

// Targets are all functions that return an array,
// of either of players, cards, or pieces (objects on board).
// An empty array means either that there are no valid targets
// or that a player still needs to choose a target.

export default function targets(state, currentObject) {
  return {
    all: function (collection) {
      return Object.values(collection);
    },

    // TODO Also handle the case when collection is an array of cards (rather than objects).
    choose: function (collection) {
      if (state.target.chosen) {
        return state.target.chosen;
      } else {
        if (!_.isEmpty(collection)) {
          state.target.choosing = true;
          state.target.possibleHexes = Object.keys(collection);
        }
        return [];
      }
    },

    thisRobot: function () {
      return [currentObject];
    },

    self: function () {
      if (currentObject) {
        return [ownerOf(state, currentObject)];
      } else {
        return [currentPlayer(state)];
      }
    },

    opponent: function () {
      if (currentObject) {
        return [ownerOf(state, currentObject).name == 'blue' ? state.players.orange : state.players.blue];
      } else {
        return [opponentPlayer(state)];
      }
    },

    allPlayers: function () {
      return [currentPlayer(state), opponentPlayer(state)];
    }
  };
}
