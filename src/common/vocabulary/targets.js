import { isArray, isEmpty } from 'lodash';
import { pick } from 'shuffle-array';

import { opponent, currentPlayer, opponentPlayer, allObjectsOnBoard, ownerOf } from '../util/game';

function collectionType(collection) {
  return isArray(collection[0]) ? 'objects' : 'cards';
}

// Targets are all functions that return an array,
// of either of players, cards, or pieces (objects on board).
// An empty array means either that there are no valid targets
// or that a player still needs to choose a target.

export default function targets(state, currentObject) {
  return {
    all: function (collection) {
      if (collectionType(collection) === 'objects') {
        return collection.map(([hex, obj]) => obj);
      } else {
        return collection;
      }
    },

    allPlayers: function () {
      return [currentPlayer(state), opponentPlayer(state)];
    },

    // Note: Unlike other target functions, choose() can return an [hex]
    //       (if the chosen hex does not contain an object.)
    choose: function (collection) {
      const player = currentPlayer(state);

      if (player.target.chosen) {
        // Return and clear chosen target.
        const chosenTargets = player.target.chosen;
        state.it = chosenTargets[0];  // "it" stores most recently chosen salient object for lookup.

        // Return objects if possible or hexes if not. (Cards can also be returned.)
        return chosenTargets.map(t => allObjectsOnBoard(state)[t] || t);
      } else {
        if (!isEmpty(collection)) {
          // Prepare target selection.
          player.target.choosing = true;

          if (collectionType(collection) === 'objects') {
            // Don't allow player to pick the object that is being played (if any).
            player.target.possibleHexes = collection.filter(([hex, obj]) => !obj || !obj.justPlayed)
                                                    .map(([hex, obj]) => hex);
            player.target.possibleCards = [];
          } else {
            player.target.possibleCards = collection.map(card => card.id);
            player.target.possibleHexes = [];
          }

          state.players[player.name] = player;
        }
        return [];
      }
    },

    controllerOf: function (objects) {
      // Assume that only one object is ever passed in here.
      return (objects.length === 1) ? [ownerOf(state, objects[0])] : [];
    },

    // Currently salient object.
    it: function () {
      /* console.log({
        it: state.it ? state.it.name || state.it.card.name : null,
        currentObject: currentObject ? currentObject.name || currentObject.card.name : null
      }); */

      // currentObject has higher salience than state.it .
      // (This resolves the bug where robots' Haste ability would be triggered by other robots being played.)
      return (currentObject || state.it) ? [currentObject || state.it] : [];
    },

    // Currently salient player.
    itP: function () {
      return state.itP ? [state.itP] : [];
    },

    opponent: function () {
      if (currentObject) {
        return [state.players[opponent(ownerOf(state, currentObject).name)]];
      } else {
        return [opponentPlayer(state)];
      }
    },

    random: function (num, collection) {
      const candidates = collectionType(collection) === 'objects' ? collection.map(([hex, obj]) => obj) : collection;
      const chosen = pick(candidates, {picks: num, rng: state.rng});
      return isArray(chosen) ? chosen : [chosen];
    },

    self: function () {
      if (currentObject) {
        return [ownerOf(state, currentObject)];
      } else {
        return [currentPlayer(state)];
      }
    },

    thisRobot: function () {
      return [currentObject];
    }
  };
}
