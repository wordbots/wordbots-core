import { opponent, currentPlayer, opponentPlayer, allObjectsOnBoard, ownerOf } from '../util';

// Targets are all functions that return an array,
// of either of players, cards, or pieces (objects on board).
// An empty array means either that there are no valid targets
// or that a player still needs to choose a target.

export default function targets(state, currentObject) {
  return {
    all: function (collection) {
      return Object.values(collection);
    },

    // Note: Unlike other target functions, choose() can return an [hex]
    //       (if the chosen hex does not contain an object.)
    choose: function (collection) {
      if (state.target.chosen) {
        // Return and clear chosen target.
        const chosenTargets = state.target.chosen;
        state.it = chosenTargets[0];  // "it" stores most recently chosen salient object for lookup.

        // Return objects if possible or hexes if not. (Cards can also be returned.)
        return chosenTargets.map(t => allObjectsOnBoard(state)[t] || t);
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
            // Don't allow player to pick the object that is being played (if any).
            state.target.possibleHexes = Object.keys(_.omitBy(collection, obj => obj && obj.justPlayed));
            state.target.possibleCards = [];
          }
        }
        return [];
      }
    },

    thisRobot: function () {
      return [currentObject];
    },

    it: function () {
      return state.it ? [state.it] : [];
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
        return [state.players[opponent(ownerOf(state, currentObject).name).name]];
      } else {
        return [opponentPlayer(state)];
      }
    },

    allPlayers: function () {
      return [currentPlayer(state), opponentPlayer(state)];
    },

    controllerOf: function (objects) {
      // Assume the only one object is ever passed in here.
      return (objects.length === 1) ? [ownerOf(state, objects[0])] : [];
    }
  };
}
