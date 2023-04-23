import { cloneDeep, groupBy, identity, isArray, isFunction, mapValues } from 'lodash';
import { shuffle } from 'seed-shuffle';

import { TYPE_CORE } from '../constants';
import * as g from '../guards';
import { moveObjectUsingAbility, swapObjectPositions } from '../reducers/handlers/game/board';
import { afterObjectPlayed, instantiateObject } from '../reducers/handlers/game/cards';
import * as w from '../types';
import { splitSentences } from '../util/cards';
import { applyFuncToField, applyFuncToFields, clamp, withTrailingPeriod } from '../util/common';
import {
  allObjectsOnBoard, currentPlayer, dealDamageToObjectAtHex, discardCardsFromHand, drawCards, executeCmd, getHex, opponent, ownerOf, ownerOfCard,
  passTurn, removeCardsFromDiscardPile, removeCardsFromHand, removeObjectFromBoard, updateOrDeleteObjectAtHex
} from '../util/game';
import { tryToRewriteCard } from '../util/rewrite';

export default function actions(state: w.GameState, currentObject: w.Object | null): Record<string, w.Returns<void>> {
  const iterateOver = <T extends w.Targetable>(collection: w.Collection, shouldReassignPlayerToKernel = true) => (fn: (item: T) => void) => {
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
      return Object.values(target.objectsOnBoard).find((obj) => obj.type === TYPE_CORE)! as T;
    } else {
      return target as T;
    }
  };

  // modifyAttribute() is defined here because it is also called by setAttribute().
  const modifyAttribute = (
    objects: w.ObjectOrPlayerCollection | w.CardInHandCollection,
    attr: w.Attribute | w.Attribute[] | 'cost' | 'allattributes',
    func: ((a: number) => number) | w.StringRepresentationOf<(a: number) => number>
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
          Object.assign(object.stats, mapValues(object.stats, clamp(func)) as { attack?: number, health: number, speed?: number });
        } else if (attr === 'cost' && !g.isObject(object)) {
          object.cost = clamp(func)((object).cost);
        } else {
          Object.assign(object.stats, applyFuncToFields(object.stats, func, isArray(attr) ? attr : [attr]));
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
            triggers: [],
            temporaryStatAdjustments: null
          });
        });

        // Set triggers one-by-one.
        if (card.abilities && card.abilities.length > 0) {
          card.abilities.forEach((cmd, idx) => {
            const cmdText = splitSentences(card.text)[idx];
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
        Object.assign(object, { cantAttack: false });
      });
    },

    canMoveAgain: (objects: w.ObjectOrPlayerCollection): void => {
      iterateOver<w.Object>(objects)((object: w.Object) => {
        Object.assign(object, { movesMade: 0, cantMove: false });
      });
    },

    canMoveAndAttackAgain: (objects: w.ObjectOrPlayerCollection): void => {
      iterateOver<w.Object>(objects)((object: w.Object) => {
        Object.assign(object, { movesMade: 0, cantMove: false, cantAttack: false });
      });
    },

    dealDamage: (targets: w.ObjectOrPlayerCollection, amount: number): void => {
      iterateOver<w.Object>(targets)((target: w.Object) => {
        const hex = getHex(state, target)!;
        dealDamageToObjectAtHex(state, amount, hex, currentObject);
      });
    },

    destroy: (objects: w.ObjectOrPlayerCollection): void => {
      iterateOver<w.Object>(objects)((object) => {
        object.isDestroyed = true;
        updateOrDeleteObjectAtHex(state, object, getHex(state, object)!);
      });
    },

    discard: (cards: w.CardInHandCollection): void => {
      Object.entries(
        groupBy(cards.entries, (card) => ownerOfCard(state, card)?.color)
      )
        .filter(([owner]) => owner)
        .forEach(([owner, ownedCards]) => {
          discardCardsFromHand(state, owner as w.PlayerColor, ownedCards);
        });
    },

    draw: (players: w.PlayerCollection, count: number): void => {
      players.entries.forEach((player: w.PlayerInGameState) => {
        drawCards(state, player, count);
      });
    },

    endTurn: (): void => {
      state.callbackAfterExecution = (s: w.GameState) => passTurn(s, s.currentTurn);
    },

    forEach: (collection: w.Collection, cmd: (s: w.GameState) => unknown): void => {
      iterateOver(collection, false)((elt: w.Targetable) => {
        executeCmd(state, cmd, g.isObject(elt) ? elt : currentObject);
      });
    },

    giveAbility: (objects: w.ObjectOrPlayerCollection, abilityCmd: w.StringRepresentationOf<(s: w.GameState) => unknown>): void => {
      iterateOver<w.Object>(objects)((object: w.Object) => {
        // Execute the ability command.
        executeCmd(state, abilityCmd, object);

        // Add the ability text to the object's card display (if we are able to parse the ability text correctly from the original command text).
        const abilityText = state.currentCmdText;
        if (abilityText && !abilityText.includes('"')) {
          const objCurrentText = object.card.text;
          object.card.text = objCurrentText ? `${withTrailingPeriod(objCurrentText)} ${withTrailingPeriod(abilityText)}` : withTrailingPeriod(abilityText);
          object.card.highlightedTextBlocks = [...(object.card.highlightedTextBlocks || []), abilityText];
        }
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

    // TODO hexes: w.HexCollection is only supported for backwards-compatibility pre-v0.19 – can remove once all cards are merged to 0.19+
    moveObject: (objects: w.ObjectCollection, hexes: w.HexCollection | (() => w.HexCollection)): void => {
      // Unpack.
      iterateOver<w.Object>(objects)((object: w.Object) => {
        const destHex: w.HexId | undefined = (isFunction(hexes) ? hexes() : hexes).entries[0];

        if (object && destHex) {
          const startHex = getHex(state, object)!;
          moveObjectUsingAbility(state, startHex, destHex);
        }
      });
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
          card: { ...object.card, text: '' },

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

    returnToHand: (objects: w.ObjectCollection, players: w.PlayerCollection | null): void => {
      iterateOver<w.Object>(objects)((object: w.Object) => {
        const ownerName = ownerOf(state, object)!.color;
        const player = players ? players.entries[0] : state.players[ownerName];  // Default to card owner by default

        player.hand = player.hand.concat([object.card]);
        removeObjectFromBoard(state, object, getHex(state, object)!);
      });
    },

    rewriteText: (targets: w.CardInHandCollection, textReplacements: Record<string, string>): void => {
      // TODO figure out some way to test this (maybe with a mock parser?)
      /* istanbul ignore next */
      state.callbackAfterExecution = (s: w.GameState) => {
        iterateOver<w.CardInGame>(targets)((card: w.CardInGame) => {
          tryToRewriteCard(s, card, textReplacements);
        });
        return s;
      };
    },

    setAttribute: (
      objects: w.ObjectOrPlayerCollection,
      attr: w.Attribute | w.Attribute[] | 'cost' | 'allattributes',
      numCmd: w.StringRepresentationOf<(s: w.GameState) => number>
    ): void => {
      if (state.memory.duration) {
        // Temporary attribute adjustment.
        modifyAttribute(objects, attr, numCmd);
      } else {
        // Permanent attribute adjustment.
        iterateOver<w.Object>(objects)((object: w.Object) => {
          const value = executeCmd(state, numCmd) as number;
          const target: w.ObjectCollection = { type: 'objects', entries: [object] };
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
            owner.objectsOnBoard[hex] = object;
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
        object.stats[attr2] = savedAttr1!;
        object.stats[attr1] = savedAttr2!;
        updateOrDeleteObjectAtHex(state, object, getHex(state, object)!);
      });
    },

    swapPositions: (target1: w.ObjectCollection, target2: w.ObjectCollection): void => {
      // Unpack.
      const object1: w.Object | undefined = target1.entries[0];
      const object2: w.Object | undefined = target2.entries[0];

      // (Don't try to do anything if targets don't exist – i.e. aren't selected yet)
      if (object1 && object2) {
        const hex1 = getHex(state, object1);
        const hex2 = getHex(state, object2);
        if (hex1 && hex2) {
          swapObjectPositions(state, hex1, hex2);
        }
      }
    },

    takeControl: (players: w.PlayerCollection, objects: w.ObjectCollection): void => {
      const newOwner: w.PlayerInGameState = players.entries[0]; // Unpack player.

      iterateOver<w.Object>(objects)((object: w.Object) => {
        const currentOwner: w.PlayerInGameState = ownerOf(state, object)!;
        if (newOwner.color !== currentOwner.color) {
          const hex = getHex(state, object)!;

          newOwner.objectsOnBoard[hex] = object;
          delete currentOwner.objectsOnBoard[hex];
        }
      });
    },

    winGame: (players: w.PlayerCollection): void => {
      const player = players.entries[0];
      const opponentPlayer = state.players[opponent(player.color)];
      const opponentKernel = Object.values(opponentPlayer.objectsOnBoard).find((o) => o.type === TYPE_CORE);

      if (opponentKernel) {
        opponentKernel.isDestroyed = true;
        updateOrDeleteObjectAtHex(state, opponentKernel, getHex(state, opponentKernel)!);
      }
    }
  };
}
