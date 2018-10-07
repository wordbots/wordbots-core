import * as w from '../types';

import { allObjectsOnBoard, allHexIds, getHex, matchesType } from '../util/game';

// A collection is a function that returns one of:
//    {type: 'cards', entries: <an array of cards in a players' hand>}
//    {type: 'objects', entries: <array of objects on the board>}
//    {type: 'hexes', entries: <array of hex ids>}

export function allTiles(_: w.GameState): w.Returns<w.HexCollection> {
  return () => {
    return {type: 'hexes', entries: allHexIds()};
  };
}

export function cardsInHand(_: w.GameState): w.Returns<w.CardCollection> {
  return (players: w.PlayerCollection, cardType: string) => {
    const player = players.entries[0]; // Unpack player target.
    return {
      type: 'cards',
      entries: (player.hand as w.CardInGame[]).filter((card: w.CardInGame) =>
        matchesType(card, cardType) && !card.justPlayed
      )
    };
  };
}

// Included here for backwards compatibility, but no longer outputted by the parser.
export function objectsInPlay(state: w.GameState): w.Returns<w.ObjectCollection> {
  return (objType: string) => {
    return objectsMatchingConditions(state)(objType, []);
  };
}

export function objectsMatchingConditions(state: w.GameState): w.Returns<w.ObjectCollection> {
  return (objType: string, conditions: Array<(hex: w.HexId, obj: w.Object) => boolean>) => {
    const objects = Object.values(allObjectsOnBoard(state)).filter((obj: w.Object) =>
      matchesType(obj, objType) && conditions.every((cond) => cond(getHex(state, obj)!, obj))
    );
    return {type: 'objects', entries: objects};
  };
}

export function other(_: w.GameState, currentObject: w.Object | null): w.Returns<w.ObjectCollection> {
  return (collection) => {
    return {
      type: 'objects',
      entries: collection.entries.filter((obj: w.Object) =>
        obj.id !== currentObject!.id
      )
    };
  };
}

export function tilesMatchingConditions(state: w.GameState): w.Returns<w.Collection> {
  return (conditions: Array<(hex: w.HexId, obj: w.Object) => boolean>) => {
    const hexes = allHexIds().filter((hex) =>
      conditions.every((cond) => cond(hex, allObjectsOnBoard(state)[hex]))
    );
    return {type: 'hexes', entries: hexes};
  };
}
