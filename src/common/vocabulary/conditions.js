import {flatMap, has, some} from 'lodash';

import {allHexIds, getHex, getAttribute, getAdjacentHexes} from '../util/game';
import HU from '../components/hexgrid/HexUtils';

function objectHasProperty(obj, property){
  switch (property) {
    // Simple properties.
    case 'attackedlastturn':
      return obj.attackedLastTurn;
    case 'attackedthisturn':
      return obj.attackedThisTurn;
    case 'movedlastturn':
      return obj.movedLastTurn;
    case 'movedthisturn':
      return obj.movedThisTurn;
    case 'isdestroyed':
      return obj.isDestroyed;

    // Complex properties.
    case 'isdamaged':
      return getAttribute(obj, 'health') < obj.card.stats.health;
  }
}

// Object conditions return (hexId, obj) -> bool functions.
// They are used by the objectsMatchingConditions() collection.
export function objectConditions(state){
  return {
    adjacentTo: function (targets){
      const targetHexIds = targets.type === 'objects' ? targets.entries.map(o => getHex(state, o)) : targets.entries;
      const neighborHexes = flatMap(targetHexIds, hid => getAdjacentHexes(HU.IDToHex(hid))).map(HU.getID);

      return (hexId, obj) => neighborHexes.includes(hexId);
    },

    attributeComparison: function (attr, comp){
      return (hexId, obj) => comp(getAttribute(obj, attr));
    },

    controlledBy: function (players){
      const player = players.entries[0]; // Unpack player target.
      return (hexId, obj) => has(player.robotsOnBoard, hexId);
    },

    // Only used interally, not exposed by parser.
    hasId: function (id){
      return (hexId, obj) => obj.id === id;
    },

    hasProperty: function (property){
      return (hexId, obj) => objectHasProperty(obj, property);
    },

    withinDistanceOf: function (distance, targets){
      const targetHexIds = targets.type === 'objects' ? targets.entries.map(o => getHex(state, o)) : targets.entries;
      const nearbyHexIds = allHexIds().filter(h1 =>
        some(targetHexIds, h2 => HU.distance(HU.IDToHex(h1), HU.IDToHex(h2)) <= distance)
      );

      return (hexId, obj) => nearbyHexIds.includes(hexId);
    }
  };
}

// Global conditions simply return a boolean.
// They're used in if-expressions.
export function globalConditions(state){
  return {
    collectionExists: function (collection){
      return collection.length > 0;
    },

    targetHasProperty: function (target, property){
      return target.entries.every(obj => objectHasProperty(obj, property));
    }
  };
}
