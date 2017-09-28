import { cloneDeep, findKey, mapValues } from 'lodash';

import { TYPE_CORE } from '../constants';
import { clamp, applyFuncToField } from '../util/common';
import {
  ownerOf, getHex,
  passTurn, drawCards, removeCardsFromHand, dealDamageToObjectAtHex, updateOrDeleteObjectAtHex,
  executeCmd
} from '../util/game';
import { moveObjectUsingAbility } from '../reducers/handlers/game/board';

export default function actions(state) {
  return {
    becomeACopy: function (sources, targets) {
      const target = targets.entries[0]; // Unpack target.
      sources.entries.forEach(source => {
        Object.assign(source, {
          card: cloneDeep(target.card),
          stats: cloneDeep(target.stats),
          triggers: cloneDeep(target.triggers),
          abilities: cloneDeep(target.abilities),
          movesMade: target.movesMade,
          cantMove: target.cantMove,
          cantAttack: target.cantAttack,
          cantActivate: target.cantActivate
        });
      });
    },

    canAttackAgain: function (objects) {
      objects.entries.forEach(object => {
        Object.assign(object, {cantAttack: false});
      });
    },

    canMoveAgain: function (objects) {
      objects.entries.forEach(object => {
        Object.assign(object, {movesMade: 0, cantMove: false});
      });
    },

    canMoveAndAttackAgain: function (objects) {
      objects.entries.forEach(object => {
        Object.assign(object, {movesMade: 0, cantMove: false, cantAttack: false});
      });
    },

    dealDamage: function (targets, amount) {
      targets.entries.forEach(target => {
        let hex;
        if (target.robotsOnBoard) {
          // target is a player, so reassign damage to their core.
          hex = findKey(target.robotsOnBoard, {card: {type: TYPE_CORE}});
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
      removeCardsFromHand(state, cards.entries);
    },

    draw: function (players, count) {
      players.entries.forEach(player => { drawCards(state, player, count); });
    },

    endTurn: function () {
      state = Object.assign(state, passTurn(state));
    },

    giveAbility: function (objects, abilityCmd) {
      objects.entries.forEach(object => {
        executeCmd(state, abilityCmd, object);
      });
    },

    modifyAttribute: function (objects, attr, func) {
      if (state.memory['duration']) {
        // Temporary attribute adjustment.
        objects.entries.forEach(object => {
          const targetFn = `() => objectsMatchingConditions('allobjects', [conditions['hasId']('${object.id}')])`;
          const abilityCmd = `() => { setAbility(abilities['attributeAdjustment']("${targetFn}", '${attr}', ${func})); }`;

          executeCmd(state, abilityCmd, object);
        });
      } else {
        // Permanent attribute adjustment.
        objects.entries.forEach(object => {
          if (attr === 'allattributes') {
            object.stats = mapValues(object.stats, clamp(func));
          } else if (attr === 'cost') {
            object.cost = clamp(func)(object.cost); // (This should only ever happen to cards in hand.)
          } else {
            object.stats = applyFuncToField(object.stats, func, attr);
          }
        });
      }
    },

    modifyEnergy: function (players, func) {
      players.entries.forEach(player => {
        player.energy = applyFuncToField(player.energy, func, 'available');
      });
    },

    moveObjects: function (objects, hexes) {
      // Unpack.
      const object = objects.entries[0];
      const hex = hexes.entries[0];

      const source = getHex(state, object);

      moveObjectUsingAbility(state, source, hex);
    },

    payEnergy: function (players, amount) {
      players.entries.forEach(player => {
        if (player.energy.available >= amount) {
          player.energy.available -= amount;
        } else {
          state.invalid = true;
        }
      });
    },

    removeAllAbilities: function (objects) {
      objects.entries.forEach(object => {
        Object.assign(object, {
          triggers: [],
          abilities: object.abilities.map(ability => ({...ability, disabled: true})),

          activatedAbilities: [],
          effects: [],
          temporaryStatAdjustments: []
        });
      });
    },

    restoreHealth: function (objects, num) {
      objects.entries.forEach(object => {
        if (object.stats.health < object.card.stats.health) {
          if (num) {
            object.stats.health = Math.min(object.card.stats.health, object.stats.health + num);
          } else {
            object.stats.health = object.card.stats.health;
          }
        }
      });
    },

    setAttribute: function (objects, attr, num) {
      if (state.memory['duration']) {
        // Temporary attribute adjustment.
        this.modifyAttribute(objects, attr, `(function () { return ${num}; })`);
      } else {
        // Permanent attribute adjustment.
        this.modifyAttribute(objects, attr, () => num);
      }
    },

    swapAttributes: function (objects, attr1, attr2) {
      objects.entries.forEach(object => {
        const [savedAttr1, savedAttr2] = [object.stats[attr1], object.stats[attr2]];
        object.stats[attr2] = savedAttr1;
        object.stats[attr1] = savedAttr2;
        updateOrDeleteObjectAtHex(state, object, getHex(state, object));
      });
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
