import { every } from 'lodash';

import { allObjectsOnBoard, getHex, matchesType } from '../util/game';
import GridGenerator from '../components/react-hexgrid/GridGenerator';
import HexUtils from '../components/react-hexgrid/HexUtils';

// A collection is a function that returns one of:
//    {type: 'cards', entries: <an array of cards in a players' hand>}
//    {type: 'objects', entries: <array of objects on the board>}
//    {type: 'hexes', entries: <array of hex ids>}

export function allTiles(state) {
  return function () {
    return {type: 'hexes', entries: GridGenerator.hexagon(4).map(HexUtils.getID)};
  };
}

export function cardsInHand(state) {
  return function (players, cardType) {
    const player = players.entries[0]; // Unpack player target.
    return {type: 'cards', entries: player.hand.filter(c => matchesType(c, cardType) && !c.justPlayed)};
  };
}

export function objectsInPlay(state) {
  return function (objType) {
    return objectsMatchingConditions(state)(objType, []);
  };
}

export function objectsMatchingConditions(state) {
  return function (objType, conditions) {
    const objects = Object.values(allObjectsOnBoard(state)).filter(obj =>
      matchesType(obj, objType) && every(conditions.map(cond => cond(getHex(state, obj), obj)))
    );
    return {type: 'objects', entries: objects};
  };
}

export function other(state, currentObject) {
  return function (collection) {
    return {type: 'objects', entries: collection.entries.filter(obj => obj.id !== currentObject.id)};
  };
}
