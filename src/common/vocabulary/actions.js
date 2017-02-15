import { TYPE_CORE } from '../constants';
import { getHex, drawCards, dealDamageToObjectAtHex, updateOrDeleteObjectAtHex } from '../util';

export default function actions(state) {
  return {
    canMoveAgain: function (objects) {
      objects.forEach(object => object.movesLeft = object.stats.speed);
    },

    dealDamage: function (objects, amount) {
      objects.forEach(function (target) {
        let hex;
        if (target.robotsOnBoard) {
          // target is a player, so reassign damage to their core.
          hex = _.find(_.toPairs(target.robotsOnBoard), hexObj => hexObj[1].card.type == TYPE_CORE)[0];
        } else {
          // target is an object, so find its hex.
          hex = getHex(state, target);
        }

        dealDamageToObjectAtHex(state, amount, hex);
      });
    },

    destroy: function (objects) {
      objects.forEach(function (object) {
        object.isDestroyed = true;
        updateOrDeleteObjectAtHex(state, object, getHex(state, object));
      });
    },

    // TODO discard(objects) -- requires choice?

    draw: function (players, count) {
      players.forEach(player => drawCards(state, player, count));
    },

    modifyAttribute: function (objects, attr, func) {
      const clampedFunc = stat => _.clamp(func(stat), 0, 99);

      objects.forEach(function (object) {
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
      objects.forEach(function (object) {
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
