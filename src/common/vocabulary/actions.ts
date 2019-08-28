import { cloneDeep, identity, isArray, mapValues } from 'lodash';
import { shuffle } from 'seed-shuffle';

import { TYPE_CORE } from '../constants';
import * as g from '../guards';
import { moveObjectUsingAbility } from '../reducers/handlers/game/board';
import { afterObjectPlayed, instantiateObject } from '../reducers/handlers/game/cards';
import * as w from '../types';
import { splitSentences } from '../util/cards';
import { applyFuncToField, applyFuncToFields, clamp } from '../util/common';
import {
  allObjectsOnBoard, currentPlayer, dealDamageToObjectAtHex, drawCards, executeCmd, getHex, ownerOf, ownerOfCard,
  passTurn, removeCardsFromDiscardPile, removeCardsFromHand, removeObjectFromBoard, updateOrDeleteObjectAtHex
} from '../util/game';

export default function actions(state: w.GameState, currentObject: w.Object | null): Record<string, w.Returns<void>> {
  const iterateOver = <T extends w.Targetable>(collection: w.Collection, shouldReassignPlayerToKernel: boolean = true) => (fn: (item: T) => void) => {
    const items: T[] = (collection.entries as w.Targetable[]).map(shouldReassignPlayerToKernel ? reassignToKernelIfPlayer : identity) as T[];
    items.forEach((item: T) => {
      state.currentEntryInCollection = item;  // (Needed for tracking of targets.they)
      fn(item);
      state.currentEntryInCollection = undefined;
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
    objects: w.ObjectOrPlayerCollection | w.CardInHandCollection,
    attr: w.Attribute | w.Attribute[] | 'cost' | 'allattributes',
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
          object.stats = applyFuncToFields(object.stats, func, isArray(attr) ? attr : [attr]);
        }
      });
    }
  };

  return {
    // Become a card.
    become: (sources: w.ObjectOrPlayerCollection, cards: w.CardInHandCollection): void => {
      const card = cards.entries[0];
      if (card) {
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

    discard: (cards: w.CardInHandCollection): void => {
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

    forEach: (collection: w.Collection, cmd: (state: w.GameState) => any): void => {
      iterateOver(collection, false)((elt: w.Targetable) => {
        executeCmd(state, cmd, g.isObject(elt) ? elt : currentObject);
      });
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

    moveCardsToHand: (cards: w.CardInDiscardPileCollection, players: w.PlayerCollection): void => {
      // Unpack.
      const recipient: w.PlayerInGameState = players.entries[0];

      removeCardsFromDiscardPile(state, cards.entries, (card) => {
        recipient.hand.push(card);
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
          card: {...object.card, text: ''},

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
      attr: w.Attribute | w.Attribute[] | 'cost' | 'allattributes',
      numCmd: w.StringRepresentationOf<(state: w.GameState) => number>
    ): void => {
      if (state.memory.duration) {
        // Temporary attribute adjustment.
        modifyAttribute(objects, attr, numCmd);
      } else {
        // Permanent attribute adjustment.
        iterateOver<w.Object>(objects)((object: w.Object) => {
          const value = executeCmd(state, numCmd) as number;
          const target: w.ObjectCollection = {type: 'objects', entries: [object]};
          modifyAttribute(target, attr, () => value);
        });
      }
    },

    shuffleCardsIntoDeck: (cards: w.CardInHandCollection | w.CardInDiscardPileCollection, players: w.PlayerCollection): void => {
      // Unpack.
      const recipient: w.PlayerInGameState = players.entries[0];
      const collectionType = cards.type;

      if (cards.entries.length === 0 || !recipient) {
        return;
      } else if (collectionType === 'cards') {
        removeCardsFromHand(state, cards.entries, ownerOfCard(state, (cards as w.CardInHandCollection).entries[0]));
        recipient.deck = shuffle([...recipient.deck, ...cards.entries], state.rng());
      } else if (collectionType === 'cardsInDiscardPile') {
        removeCardsFromDiscardPile(state, cards.entries, (card) => {
          recipient.deck = shuffle([...recipient.deck, card], state.rng());
        });
      }
    },

    // For (temporary) backwards compatibility with old cards, `owners` can be undefined (in which case, a sensible default owner is chosen).
    spawnObject: (cards: w.CardInHandCollection | w.CardInDiscardPileCollection, hexes: w.HexCollection, owners?: w.PlayerCollection): void => {
      const card: w.CardInGame = cards.entries[0];
      if (card) {
        const defaultOwner = (currentObject && ownerOf(state, currentObject)) || currentPlayer(state);
        const owner: w.PlayerInGameState = owners ? owners.entries[0] : defaultOwner;

        iterateOver<w.HexId>(hexes)((hex: w.HexId) => {
          if (!allObjectsOnBoard(state)[hex]) {
            const object: w.Object = instantiateObject(card);
            owner.robotsOnBoard[hex] = object;
            afterObjectPlayed(state, object);
          }
        });

        if (cards.type === 'cardsInDiscardPile') {
          removeCardsFromDiscardPile(state, [card]);
        }
      }
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
