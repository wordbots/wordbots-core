import { findKey, mapValues } from 'lodash';

import { TYPE_CORE } from '../constants';
import { clamp, applyFuncToField } from '../util/common';
import {
  ownerOf, getHex,
  drawCards, discardCards, dealDamageToObjectAtHex, updateOrDeleteObjectAtHex,
  executeCmd
} from '../util/game';

export default function actions(state) {
  return {
    canMoveAgain: function (objects) {
      objects.entries.forEach(object => { Object.assign(object, {movesMade: 0, cantMove: false}); });
    },

    dealDamage: function (targets, amount) {
      targets.entries.forEach(target => {
        let hex;
        if (target.robotsOnBoard) {
          // target is a player, so reassign damage to their core.
          hex = findKey(target.robotsOnBoard, obj => obj.card.type === TYPE_CORE);
        } else {
          // target is an object, so find its hex.
          hex = getHex(state, target);
        }

        dealDamageToObjectAtHex(state, amount, hex);
      });
    },

    destroy: function (objects) {
      objects.entries.forEach(object => {
        object.isDestroyed = true;
        updateOrDeleteObjectAtHex(state, object, getHex(state, object));
      });
    },

    discard: function (cards) {
      discardCards(state, cards.entries);
    },

    draw: function (players, count) {
      players.entries.forEach(player => { drawCards(state, player, count); });
    },

    endTurn: function () {
      // TODO
    },

    giveAbility: function (objects, abilityCmd) {
      objects.entries.forEach(object => {
        executeCmd(state, abilityCmd, object);
      });
    },

    modifyAttribute: function (objects, attr, func) {
      objects.entries.forEach(object => {
        if (attr === 'allattributes') {
          object.stats = mapValues(object.stats, clamp(func));
        } else if (attr === 'cost') {
          object.cost = clamp(func)(object.cost); // (This should only ever happen to cards in hand.)
        } else {
          object.stats = applyFuncToField(object.stats, func, attr);
        }
      });
    },

    modifyEnergy: function (players, func) {
      players.entries.forEach(player => {
        player.energy = applyFuncToField(player.energy, func, 'available');
      });
    },

    restoreHealth: function (objects) {
      // TODO
    },

    setAttribute: function (objects, attr, num) {
      this.modifyAttribute(objects, attr, () => num);
    },

    swapAttributes: function (objects, attr1, attr2) {
      // TODO
    },

    takeControl: function (players, objects) {
      const newOwner = players.entries[0]; // Unpack player.

      objects.entries.forEach(object => {
        const currentOwner = ownerOf(state, object);
        if (newOwner.name !== currentOwner.name) {
          const hex = getHex(state, object);

          newOwner.robotsOnBoard[hex] = object;
          delete currentOwner.robotsOnBoard[hex];
        }
      });
    }
  };
}
