import { opponent, currentPlayer, opponentPlayer, allObjectsOnBoard, ownerOf } from '../util';

// Targets are all functions that return an array,
// of either of players, cards, or pieces (objects on board).
// An empty array means either that there are no valid targets
// or that a player still needs to choose a target.

export default function targets(state, currentObject) {
  return {
    all: function (collection) {
      if (_.isArray(collection[0])) {
        // Collection of objects.
        return collection.map(([hex, obj]) => obj);
      } else {
        // Collection of cards.
        return collection;
      }
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

          if (_.isArray(collection[0])) {
            // Collection of objects.
            // Don't allow player to pick the object that is being played (if any).
            state.target.possibleHexes = collection.filter(([hex, obj]) => !obj || !obj.justPlayed)
                                                   .map(([hex, obj]) => hex);
            state.target.possibleCards = [];
          } else {
            // Collection of cards.
            state.target.possibleCards = collection.map(card => card.id);
            state.target.possibleHexes = [];
          }
        }
        return [];
      }
    },

    thisRobot: function () {
      return [currentObject];
    },

    // Currently salient object.
    it: function () {
      return state.it ? [state.it] : [];
    },

    // Currently salient player.
    itP: function () {
      return state.itP ? [state.itP] : [];
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
        return [state.players[opponent(ownerOf(state, currentObject).name)]];
      } else {
        return [opponentPlayer(state)];
      }
    },

    allPlayers: function () {
      return [currentPlayer(state), opponentPlayer(state)];
    },

    controllerOf: function (objects) {
      // Assume that only one object is ever passed in here.
      return (objects.length === 1) ? [ownerOf(state, objects[0])] : [];
    }
  };
}
