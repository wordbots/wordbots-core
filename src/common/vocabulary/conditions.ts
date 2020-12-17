import { flatMap, has, some } from 'lodash';

import HU from '../components/hexgrid/HexUtils';
import * as w from '../types';
import { allHexIds, getAdjacentHexes, getAttribute, getHex } from '../util/game';

function objectHasProperty(obj: w.Object, property: string): boolean {
  switch (property) {
    // Simple properties.
    case 'attackedlastturn': return obj.attackedLastTurn || false;
    case 'attackedthisturn': return obj.attackedThisTurn || false;
    case 'movedlastturn': return obj.movedLastTurn || false;
    case 'movedthisturn': return obj.movedThisTurn || false;
    case 'isdestroyed': return obj.isDestroyed || obj.beingDestroyed || false;

    // Complex properties.
    case 'isdamaged':
      return getAttribute(obj, 'health')! < obj.card.stats!.health;

    /* istanbul ignore next */
    default:
      throw new Error(`Unknown property ${property}!`);
  }
}

// Object conditions return (hexId, obj) -> bool functions.
// They are used by the objectsMatchingConditions() collection.
export type ObjectCondition = (hexId: w.HexId, obj: w.Object) => boolean;
export type CardCondition = (hexId: null, obj: w.CardInGame) => boolean;
type ObjectOrCardCondition = (hexId: w.HexId | null, obj: w.Object | w.CardInGame) => boolean;

export function objectConditions(state: w.GameState): Record<string, w.Returns<ObjectCondition>> {
  return {
    adjacentTo: (targets: w.ObjectCollection | w.HexCollection): ObjectCondition => {
      const targetHexIds: w.HexId[] = targets.type === 'objects' ? targets.entries.map((o) => getHex(state, o)!) : targets.entries;
      const neighborHexes: w.HexId[] = flatMap(targetHexIds, (h: w.HexId) => getAdjacentHexes(HU.IDToHex(h))).map(HU.getID);

      return ((hexId, _obj) => neighborHexes.includes(hexId));
    },

    attributeComparison: (attr: w.Attribute, comp: (attrValue: number) => boolean): ObjectOrCardCondition => ((_hexId, obj) => comp(getAttribute(obj, attr)!)),

    controlledBy: (players: w.PlayerCollection): ObjectCondition => {
      const player = players.entries[0]; // Unpack player target.
      return ((hexId, _obj) => has(player.objectsOnBoard, hexId));
    },

    exactDistanceFrom: (distance: number, targets: w.ObjectCollection | w.HexCollection): ObjectCondition => {
      const targetHexIds: w.HexId[] = targets.type === 'objects' ? targets.entries.map((o) => getHex(state, o)!) : targets.entries;
      const nearbyHexIds: w.HexId[] = allHexIds().filter((h1: w.HexId) =>
        some(targetHexIds, (h2: w.HexId) => HU.distance(HU.IDToHex(h1), HU.IDToHex(h2)) === distance)
      );

      return ((hexId, _obj) => nearbyHexIds.includes(hexId));
    },

    // Only used interally, not exposed by parser.
    hasId: (id: w.HexId): ObjectCondition => ((_hexId, obj) => obj.id === id),

    hasProperty: (property: string): ObjectCondition => ((_hexId, obj) => objectHasProperty(obj, property)),

    unoccupied: (): ObjectCondition => ((_hexId, obj) => !obj),

    withinDistanceOf: (distance: number, targets: w.ObjectCollection | w.HexCollection): ObjectCondition => {
      const targetHexIds: w.HexId[] = targets.type === 'objects' ? targets.entries.map((o) => getHex(state, o)!) : targets.entries;
      const nearbyHexIds: w.HexId[] = allHexIds().filter((h1: w.HexId) =>
        some(targetHexIds, (h2: w.HexId) => HU.distance(HU.IDToHex(h1), HU.IDToHex(h2)) <= distance)
      );

      return ((hexId, _obj) => nearbyHexIds.includes(hexId));
    }
  };
}

// Global conditions simply return a boolean.
// They're used in if-expressions.
export function globalConditions(state: w.GameState): Record<string, w.Returns<boolean>> {
  return {
    collectionCountComparison: (collection: w.Collection, comp: (count: number) => boolean) =>
      comp(collection.entries.length),

    collectionExists: (collection: w.Collection) =>
      collection.entries.length > 0,

    targetHasProperty: (target: w.ObjectCollection, property: string) =>
      target.entries.every((obj) => objectHasProperty(obj, property)),

    targetMeetsCondition: (target: w.ObjectCollection, condition: ObjectCondition) =>
      target.entries.every((obj) => condition(getHex(state, obj)!, obj))
  };
}
