import { flatMap, has } from 'lodash';

import { getHex, getAttribute, getAdjacentHexes } from '../util/game';
import HexUtils from '../components/react-hexgrid/HexUtils';

// Conditions are all (hex, obj) -> bool functions.
// They are used by the objectsMatchingConditions() collection.

export default function conditions(state) {
  return {
    adjacentTo: function (targets) {
      let neighborHexIds = [];
      if (targets.type === 'hexes') {
        neighborHexIds = flatMap(targets.entries, hex => getAdjacentHexes(HexUtils.IDToHex(hex)));
      } else if (targets.type === 'objects') {
        neighborHexIds = flatMap(targets.entries, obj => getAdjacentHexes(HexUtils.IDToHex(getHex(state, obj))));
      }

      return ((hex, obj) => neighborHexIds.map(HexUtils.getID).includes(hex));
    },

    attributeComparison: function (attr, comp) {
      return ((hex, obj) => comp(getAttribute(obj, attr)));
    },

    controlledBy: function (players) {
      const player = players.entries[0]; // Unpack player target.
      return ((hex, obj) => has(player.robotsOnBoard, hex));
    },

    hasProperty: function (property) {
      switch (property) {
        case 'attackedlastturn': return ((hex, obj) => obj.attackedLastTurn);
        case 'attackedthisturn': return ((hex, obj) => obj.attackedThisTurn);
        case 'movedlastturn': return ((hex, obj) => obj.movedLastTurn);
        case 'movedthisturn': return ((hex, obj) => obj.movedThisTurn);

        case 'isdamaged':
          return ((hex, obj) => getAttribute(obj, 'health') < obj.card.stats.health);
      }
    },

    withinDistanceOf: function (distance, targets) {
      // TODO
    }
  };
}
