import { TYPE_CORE } from '../constants';
import {
  currentPlayer, ownerOf, getHex,
  drawCards, dealDamageToObjectAtHex, updateOrDeleteObjectAtHex
} from '../util';

export default function actions(state) {
  return {
    canMoveAgain: function (objects) {
      objects.forEach(object => { object.movesLeft = object.stats.speed; });
    },

    dealDamage: function (targets, amount) {
      targets.forEach(target => {
        let hex;
        if (target.robotsOnBoard) {
          // target is a player, so reassign damage to their core.
          hex = _.findKey(target.robotsOnBoard, obj => obj.card.type == TYPE_CORE);
        } else {
          // target is an object, so find its hex.
          hex = getHex(state, target);
        }

        dealDamageToObjectAtHex(state, amount, hex);
      });
    },

    destroy: function (objects) {
      objects.forEach(object => {
        object.isDestroyed = true;
        updateOrDeleteObjectAtHex(state, object, getHex(state, object));
      });
    },

    discard: function (cards) {
      const cardIds = cards.map(c => c.id);
      const player = currentPlayer(state);
      player.hand = _.filter(player.hand, c => !cardIds.includes(c.id));
    },

    draw: function (players, count) {
      players.forEach(player => { drawCards(state, player, count); });
    },

    modifyAttribute: function (objects, attr, func) {
      const clampedFunc = stat => _.clamp(func(stat), 0, 99);

      objects.forEach(object => {
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
      players.forEach(player => {
        player.energy = _.assign(player.energy, {available: func(player.energy.available)});
      });
    },

    setAttribute: function (objects, attr, num) {
      objects.forEach(object => {
        if (attr === 'allattributes') {
          object.stats = _.mapValues(object.stats, () => num);
        } else if (attr === 'cost') {
          object.cost = num; // (This should only ever happen to cards in hand.)
        } else {
          object.stats = _.assign(object.stats, {[attr]: num});
        }
      });
    },

    takeControl: function (players, objects) {
      const newOwner = players[0]; // Unpack player.

      objects.forEach(object => {
        const currentOwner = ownerOf(state, object);
        if (newOwner.name != currentOwner.name) {
          const hex = getHex(state, object);

          newOwner.robotsOnBoard[hex] = object;
          delete currentOwner.robotsOnBoard[hex];
        }
      });
    }
  };
}
