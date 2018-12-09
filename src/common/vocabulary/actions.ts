import * as w from '../types';
import * as g from '../guards';

import { cloneDeep, isFunction, mapValues } from 'lodash';

import { TYPE_CORE } from '../constants';
import { clamp, applyFuncToField } from '../util/common';
import {
  currentPlayer, ownerOf, getHex, allObjectsOnBoard,
  passTurn, drawCards, removeCardsFromHand,
  dealDamageToObjectAtHex, updateOrDeleteObjectAtHex, removeObjectFromBoard,
  executeCmd
} from '../util/game';
import { splitSentences } from '../util/cards';
import { moveObjectUsingAbility } from '../reducers/handlers/game/board';
import { instantiateObject, afterObjectPlayed } from '../reducers/handlers/game/cards';

export default function actions(state: w.GameState): Record<string, w.Returns<void>> {
  const iterateOver = <T extends w.Targetable>(collection: w.Collection) => (fn: (item: T) => void) => {
    const items: T[] = (collection.entries as w.Targetable[]).map(reassignToKernelIfPlayer) as T[];
    items.forEach((item: T) => {
      state.currentObjectInCollection = item;  // (Needed for tracking of targets.they)
      fn(item);
      state.currentObjectInCollection = undefined;
    });
  };

  const reassignToKernelIfPlayer = <T extends w.Targetable>(target: w.Targetable): T => {
    if (g.isPlayerState(target)) {
      // target is actually a player, so reassign target to be their kernel.
      return Object.values(target.robotsOnBoard).find((obj) => obj.type === TYPE_CORE)! as T;
    } else {
      return target as T;
    }
  };

  // modifyAttribute() is defined here because it is also called by setAttribute().
  const modifyAttribute = (
    objects: w.ObjectOrPlayerCollection | w.CardCollection,
    attr: w.Attribute | 'cost' | 'allattributes',
    func: ((attr: number) => number) | w.StringRepresentationOf<(attr: number) => number>
  ): void => {
    if (state.memory.duration && g.isObjectCollection(objects)) {
      // Temporary attribute adjustment.
      iterateOver<w.Object>(objects)((object: w.Object) => {
        const targetFn = `() => objectsMatchingConditions('allobjects', [conditions['hasId']('${object.id}')])`;
        const abilityCmd = `() => { setAbility(abilities['attributeAdjustment']("${targetFn}", '${attr}', ${func})); }`;

        executeCmd(state, abilityCmd, object);
      });
    } else {
      // Permanent attribute adjustment.
      iterateOver<w.Object | w.CardInGame>(objects)((object: w.Object | w.CardInGame) => {
        if (attr === 'allattributes') {
          object.stats = mapValues(object.stats, clamp(func)) as {attack?: number, health: number, speed?: number};
        } else if (attr === 'cost' && !g.isObject(object)) {
          object.cost = clamp(func)((object as w.CardInGame).cost);
        } else {
          object.stats = applyFuncToField(object.stats, func, attr);
        }
      });
    }
  };

  return {
    // Become a card.
    become: (sources: w.ObjectOrPlayerCollection, cards: w.CardCollection): void => {
      const card = cards.entries[0];
      iterateOver<w.Object>(sources)((source: w.Object) => {
        Object.assign(source, {
          card: cloneDeep(card),
          stats: cloneDeep(card.stats),
          abilities: [],
          triggers: []
        });
      });

      // Set triggers one-by-one.
      if (card.abilities && card.abilities.length > 0) {
        card.abilities.forEach((cmd, idx) => {
          const cmdText = splitSentences(card.text!)[idx];
          state.currentCmdText = cmdText.includes('"') ? cmdText.split('"')[1].replace(/"/g, '') : cmdText;

          iterateOver<w.Object>(sources)((source: w.Object) => {
            executeCmd(state, cmd, source);
          });
        });
      }
    },

    canAttackAgain: (objects: w.ObjectOrPlayerCollection): void => {
      iterateOver<w.Object>(objects)((object: w.Object) => {
        Object.assign(object, {cantAttack: false});
      });
    },

    canMoveAgain: (objects: w.ObjectOrPlayerCollection): void => {
      iterateOver<w.Object>(objects)((object: w.Object) => {
        Object.assign(object, {movesMade: 0, cantMove: false});
      });
    },

    canMoveAndAttackAgain: (objects: w.ObjectOrPlayerCollection): void => {
      iterateOver<w.Object>(objects)((object: w.Object) => {
        Object.assign(object, {movesMade: 0, cantMove: false, cantAttack: false});
      });
    },

    dealDamage: (targets: w.ObjectOrPlayerCollection, amount: number): void => {
      iterateOver<w.Object>(targets)((target: w.Object) => {
        const hex = getHex(state, target)!;
        dealDamageToObjectAtHex(state, amount, hex);
      });
    },

    destroy: (objects: w.ObjectOrPlayerCollection): void => {
      iterateOver<w.Object>(objects)((object) => {
        object.isDestroyed = true;
        updateOrDeleteObjectAtHex(state, object, getHex(state, object)!);
      });
    },

    discard: (cards: w.CardCollection): void => {
      removeCardsFromHand(state, cards.entries);
    },

    draw: (players: w.PlayerCollection, count: number): void => {
      players.entries.forEach((player: w.PlayerInGameState) => {
        drawCards(state, player, count);
      });
    },

    endTurn: (): void => {
      Object.assign(state, passTurn(state, state.currentTurn));
    },

    giveAbility: (objects: w.ObjectOrPlayerCollection, abilityCmd: w.StringRepresentationOf<(state: w.GameState) => any>): void => {
      iterateOver<w.Object>(objects)((object: w.Object) => {
        executeCmd(state, abilityCmd, object);
      });
    },

    modifyAttribute,

    modifyEnergy: (players: w.PlayerCollection, func: (x: number) => number): void => {
      players.entries.forEach((player: w.PlayerInGameState) => {
        player.energy = applyFuncToField(player.energy, func, 'available');
      });
    },

    moveObject: (objects: w.ObjectCollection, hexes: w.HexCollection): void => {
      // Unpack.
      const object: w.Object | undefined = objects.entries[0] as w.Object | undefined;
      const destHex: w.HexId | undefined = hexes.entries[0];

      if (object && destHex) {
        const startHex = getHex(state, object)!;
        moveObjectUsingAbility(state, startHex, destHex);
      }
    },

    payEnergy: (players: w.PlayerCollection, amount: number): void => {
      players.entries.forEach((player: w.PlayerInGameState) => {
        if (player.energy.available >= amount) {
          player.energy.available -= amount;
        } else {
          state.invalid = true;
        }
      });
    },

    removeAllAbilities: (objects: w.ObjectOrPlayerCollection): void => {
      iterateOver<w.Object>(objects)((object: w.Object) => {
        Object.assign(object, {
          card: Object.assign({}, object.card, {text: ''}),

          triggers: [],
          abilities: object.abilities.map((ability: w.PassiveAbility) => ({ ...ability, disabled: true })),

          activatedAbilities: [],
          effects: [],
          temporaryStatAdjustments: []
        });
      });
    },

    restoreHealth: (objects: w.ObjectOrPlayerCollection, num: number): void => {
      iterateOver<w.Object>(objects)((object: w.Object) => {
        if (object.stats.health < object.card.stats!.health) {
          if (num) {
            object.stats.health = Math.min(object.card.stats!.health, object.stats.health + num);
          } else {
            object.stats.health = object.card.stats!.health;
          }
        }
      });
    },

    returnToHand: (objects: w.ObjectCollection): void => {
      iterateOver<w.Object>(objects)((object: w.Object) => {
        const ownerName = ownerOf(state, object)!.name;
        const owner = state.players[ownerName];

        owner.hand = owner.hand.concat([object.card]);
        removeObjectFromBoard(state, object, getHex(state, object)!);
      });
    },

    setAttribute: (
      objects: w.ObjectOrPlayerCollection,
      attr: w.Attribute | 'cost' | 'allattributes',
      num: number | ((state: w.GameState) => number)
    ): void => {
      if (state.memory.duration) {
        // Temporary attribute adjustment.
        modifyAttribute(objects, attr, `(function () { return ${num}; })`);
      } else {
        // Permanent attribute adjustment.
        iterateOver<w.Object>(objects)((object: w.Object) => {
          const value = isFunction(num) ? num(state) : num;  // num could be wrapped as a function of state (see targets.they)
          const target: w.ObjectCollection = {type: 'objects', entries: [object]};
          modifyAttribute(target, attr, () => value);
        });
      }
    },

    spawnObject: (cards: w.CardCollection, hexes: w.HexCollection): void => {
      const card: w.CardInGame = cards.entries[0];
      const player: w.PlayerInGameState = currentPlayer(state);

      iterateOver<w.HexId>(hexes)((hex: w.HexId) => {
        if (!allObjectsOnBoard(state)[hex]) {
          const object: w.Object = instantiateObject(card);
          player.robotsOnBoard[hex] = object;
          afterObjectPlayed(state, object);
        }
      });
    },

    swapAttributes: (objects: w.ObjectOrPlayerCollection, attr1: w.Attribute, attr2: w.Attribute): void => {
      iterateOver<w.Object>(objects)((object: w.Object) => {
        const [savedAttr1, savedAttr2] = [object.stats[attr1], object.stats[attr2]];
        object.stats[attr2] = savedAttr1;
        object.stats[attr1] = savedAttr2;
        updateOrDeleteObjectAtHex(state, object, getHex(state, object)!);
      });
    },

    takeControl: (players: w.PlayerCollection, objects: w.ObjectCollection): void => {
      const newOwner: w.PlayerInGameState = players.entries[0]; // Unpack player.

      iterateOver<w.Object>(objects)((object: w.Object) => {
        const currentOwner: w.PlayerInGameState = ownerOf(state, object)!;
        if (newOwner.name !== currentOwner.name) {
          const hex = getHex(state, object)!;

          newOwner.robotsOnBoard[hex] = object;
          delete currentOwner.robotsOnBoard[hex];
        }
      });
    }
  };
}
