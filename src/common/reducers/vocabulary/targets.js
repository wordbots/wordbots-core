import { currentPlayer, opponentPlayer, allObjectsOnBoard, ownerOf } from '../handlers/game/util';

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
      const currentObjectHex = _.findKey(allObjectsOnBoard(state), ['id', currentObject.id]);
      return [[currentObjectHex, currentObject]];
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
