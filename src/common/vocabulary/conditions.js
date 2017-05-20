import { flatMap, has, some } from 'lodash';

import { allHexIds, getHex, getAttribute, getAdjacentHexes } from '../util/game';
import HU from '../components/react-hexgrid/HexUtils';

// Conditions are (hexId, obj) -> bool functions.
// They are used by the objectsMatchingConditions() collection.
export function conditions(state) {
  return {
    adjacentTo: function (targets) {
      const targetHexIds = targets.type === 'objects' ? targets.entries.map(o => getHex(state, o)) : targets.entries;
      const neighborHexes = flatMap(targetHexIds, hid => getAdjacentHexes(HU.IDToHex(hid))).map(HU.getID);

      return ((hexId, obj) => neighborHexes.includes(hexId));
    },

    attributeComparison: function (attr, comp) {
      return ((hexId, obj) => comp(getAttribute(obj, attr)));
    },

    controlledBy: function (players) {
      const player = players.entries[0]; // Unpack player target.
      return ((hexId, obj) => has(player.robotsOnBoard, hexId));
    },

    hasProperty: function (property) {
      switch (property) {
        // Simple properties.
        case 'attackedlastturn': return ((hexId, obj) => obj.attackedLastTurn);
        case 'attackedthisturn': return ((hexId, obj) => obj.attackedThisTurn);
        case 'movedlastturn': return ((hexId, obj) => obj.movedLastTurn);
        case 'movedthisturn': return ((hexId, obj) => obj.movedThisTurn);
        case 'isdestroyed': return ((hexId, obj) => obj.isDestroyed);

        // Complex properties.
        case 'isdamaged': return ((hexId, obj) => getAttribute(obj, 'health') < obj.card.stats.health);
      }
    },

    withinDistanceOf: function (distance, targets) {
      const targetHexIds = targets.type === 'objects' ? targets.entries.map(o => getHex(state, o)) : targets.entries;
      const nearbyHexIds = allHexIds().filter(h1 =>
        some(targetHexIds, h2 => HU.distance(HU.IDToHex(h1), HU.IDToHex(h2)) <= distance)
      );

      return ((hexId, obj) => nearbyHexIds.includes(hexId));
    }
  };
}

// Global conditions simply return a boolean.
export function globalConditions(state) {
  return {
    targetHasProperty: function (target, property) {
      const condition = conditions(state).hasProperty(property);
      return target.entries.every(obj => condition(getHex(state, obj), obj));
    }
  };
}
