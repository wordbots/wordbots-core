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

    choose: function (collection) {
      if (state.target.chosen) {
        // Return and clear chosen target.
        const chosenTarget = state.target.chosen;
        state.target = {choosing: false, chosen: null, possibleHexes: [], possibleCards: []};
        return chosenTarget;
      } else {
        if (!_.isEmpty(collection)) {
          // Prepare target selection.
          state.target.choosing = true;

          if (_.isArray(collection)) {
            // Collection of cards.
            state.target.possibleCards = collection.map(card => card.id);
            state.target.possibleHexes = [];
          } else {
            // Collection of objects.
            state.target.possibleHexes = Object.keys(collection);
            state.target.possibleCards = [];
          }
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
