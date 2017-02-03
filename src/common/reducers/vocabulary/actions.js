import { TYPE_CORE } from '../../constants';
import { dealDamageToObjectAtHex } from '../handlers/game/util';

export default function actions(state) {
  return {
    canMoveAgain: function (objects) {
      objects.forEach(function ([hex, object]) {
        object.hasMoved = false;
      });
    },

    dealDamage: function (objects, amount) {
      objects.forEach(function (target) {
        let hex;
        if (target.robotsOnBoard) {
          // target is a player, so reassign damage to their core.
          hex = _.find(_.toPairs(target.robotsOnBoard), hexObj => hexObj[1].card.type == TYPE_CORE)[0];
        } else {
          // target is a [hex, object] pair.
          hex = target[0];
        }

        dealDamageToObjectAtHex(state, amount, hex);
      });
    },

    destroy: function (objects) {
      objects.forEach(function ([hex, object]) {
        delete state.players.blue.robotsOnBoard[hex];
        delete state.players.orange.robotsOnBoard[hex];
      });
    },

    // TODO discard(objects) -- requires choice?

    draw: function (players, count) {
      players.forEach(function (player) {
        player.hand = player.hand.concat(player.deck.splice(0, count));
      });
    },

    modifyAttribute: function (objects, attr, func) {
      const clampedFunc = stat => _.clamp(func(stat), 0, 99);

      objects.forEach(function ([hex, object]) {
        if (attr === 'allattributes') {
          object.stats = _.mapValues(object.stats, clampedFunc);
        } else if (attr === 'cost') {
          object.cost = clampedFunc(object.cost); // (This should only ever happen to cards in hand.)
        } else {
          object.stats = _.assign(object.stats, {[attr]: clampedFunc(object.stats[attr])});
        }
      });
    },

    modifyEnergy: function (players, func) {
      players.forEach(function (player) {
        player.energy = _.assign(player.energy, {available: func(player.energy.available)});
      });
    },

    setAttribute: function (objects, attr, num) {
      objects.forEach(function ([hex, object]) {
        if (attr === 'allattributes') {
          object.stats = _.mapValues(object.stats, () => num);
        } else if (attr === 'cost') {
          object.cost = num; // (This should only ever happen to cards in hand.)
        } else {
          object.stats = _.assign(object.stats, {[attr]: num});
        }
      });
    },
  };
}
