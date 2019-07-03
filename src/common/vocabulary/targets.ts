import { compact, fromPairs, isArray, isEmpty, isUndefined } from 'lodash';
import { pick } from 'shuffle-array';

import { stringToType } from '../constants';
import * as g from '../guards';
import * as w from '../types';
import { arrayToSentence, id } from '../util/common';
import {
  allObjectsOnBoard, currentPlayer, getHex, logAction, opponent, opponentPlayer,
  ownerOf
} from '../util/game';

// Targets are all functions that return one of:
//    {type: 'cards', entries: <an array of cards in a player's hand>}
//    {type: 'cardsInDiscardPile', entries: <an array of cards in either player's discard pile>}
//    {type: 'objects', entries: <array of objects on the board>}
//    {type: 'players', entries: <array of players>}
// An empty array of entries means either that there are no valid targets
// or that a player still needs to choose a target.
export default function targets(state: w.GameState, currentObject: w.Object | null): Record<string, w.Returns<w.Collection | w.Returns<w.Collection>>> {
  return {
    all: <T extends w.Collection>(collection: T): T => {
      return collection;
    },

    allPlayers: (): w.PlayerCollection => {
      return {type: 'players', entries: [currentPlayer(state), opponentPlayer(state)]};
    },

    // Note: Unlike other target functions, choose() can return a [hex]
    //       (if the chosen hex does not contain an object.)
    // TODO Figure out how to parametrize this method.
    choose: (collection: w.Collection): w.Collection => {
      const player = currentPlayer(state);

      if (player.target.chosen && player.target.chosen.length > 0) {
        // Return and clear chosen target.

        // If there's multiple targets, take the first (we treat target.chosen as a queue).
        const [ target, ...otherTargets ] = player.target.chosen;
        player.target.chosen = otherTargets;

        if (g.isCardInGame(target)) {
          state.it = target;  // "it" stores most recently chosen salient object for lookup.
          if (player.hand.map((card) => card.id).includes(target.id)) {
            return {type: 'cards', entries: [target]};
          } else if (player.discardPile.map((card) => card.id).includes(target.id)) {
            return {type: 'cardsInDiscardPile', entries: [target]};
          } else {
            throw new Error(`Card chosen does not exist in player's hand or discard pile!: ${target}`);
          }
        } else {
          // Return objects if possible or hexes if not.
          if (allObjectsOnBoard(state)[target]) {
            state.it = allObjectsOnBoard(state)[target];  // "it" stores most recently chosen salient object for lookup.
            return {type: 'objects', entries: [allObjectsOnBoard(state)[target]]};
          } else {
            return {type: 'hexes', entries: [target]};
          }
        }
      } else {
        if (isEmpty(collection.entries)) {
          // No valid target!
          state.invalid = true;
        } else {
          // Prepare target selection.
          player.target = {
            ...player.target,
            choosing: true,
            possibleCardsInHand: [],
            possibleCardsInDiscardPile: [],
            possibleHexes: []
          };

          if (collection.type === 'cards') {
            player.target.possibleCardsInHand = collection.entries.map((card) => card.id);
          } else if (collection.type === 'objects') {
            // Don't allow player to pick the object that is being played (if any).
            player.target.possibleHexes = collection.entries.filter((obj) => !obj.justPlayed).map((obj) => getHex(state, obj)!);
          } else if (collection.type === 'hexes') {
            // Don't allow player to pick the hex of the object that is being played (if any).
            player.target.possibleHexes = collection.entries.filter((hex) => {
              const obj = allObjectsOnBoard(state)[hex];
              return obj ? !obj.justPlayed : true;
            });
          } else if (collection.type === 'cardsInDiscardPile') {
            player.target.possibleCardsInDiscardPile = collection.entries.map((card) => card.id);
          }

          state.players[player.name] = player;
        }

        return {type: collection.type, entries: []} as w.Collection;
      }
    },

    conditionOn: (target: w.Collection, condition: () => boolean): w.Collection => {
      if (condition()) {
        return target;
      } else {
        return { type: target.type, entries: [] } as w.Collection;
      }
    },

    controllerOf: (objects: w.ObjectCollection): w.PlayerCollection => {
      // Assume that only one object is ever passed in here.
      return {type: 'players', entries: (objects.entries.length === 1) ? [ownerOf(state, objects.entries[0])!] : []};
    },

    copyOf: (collection: w.Collection): w.CardInHandCollection => {
      // Assume that exactly one object is ever passed in here.
      // currently only allow picking from objects on field.
      // allow picking from hand in future.
      if (g.isObjectCollection(collection)) {
        return {type: 'cards', entries: [collection.entries[0].card]};
      }
      return {type: 'cards', entries: []};
    },

    generateCard: (objectType: string, attributes: {attack?: number, health: number, speed?: number}, name?: string): w.CardInHandCollection => {
      const card: w.CardInGame = {
        abilities: [],
        baseCost: 0,
        cost: 0,
        id: `token/${id()}`,
        name: name || 'Token',
        source: 'generated',
        stats: attributes,
        type: stringToType(objectType)
      };
      return {type: 'cards', entries: [card]};
    },

    // Currently salient object.
    it: (): w.ObjectCollection | w.CardInHandCollection => {
      /* console.log({
        it: state.it ? state.it.name || state.it.card.name : null,
        currentObject: currentObject ? currentObject.name || currentObject.card.name : null
      }); */

      // currentObject has higher salience than state.it .
      // (This resolves the bug where robots' Haste ability would be triggered by other robots being played.)
      if (currentObject) {
        return { type: 'objects', entries: [currentObject] };
      } else if (state.it) {
        if (g.isObject(state.it)) {
          return { type: 'objects', entries: [state.it] };
        } else {
          return { type: 'cards', entries: [state.it] };
        }
      } else {
        return { type: 'objects', entries: [] };
      }
    },

    // Currently salient player.
    itP: (): w.PlayerCollection => {
      return {type: 'players', entries: compact([state.itP || opponentPlayer(state)])};
    },

    opponent: (): w.PlayerCollection => {
      if (currentObject) {
        return {type: 'players', entries: [state.players[opponent(ownerOf(state, currentObject)!.name)]]};
      } else {
        return {type: 'players', entries: [opponentPlayer(state)]};
      }
    },

    random: <T extends w.Collection>(num: number, collection: T): T => {
      let chosen = pick(collection.entries as w.Targetable[], {picks: num, rng: state.rng});
      chosen = isUndefined(chosen) ? [] : (isArray(chosen) ? chosen : [chosen]);

      // Log the random selection.
      if (chosen.length > 0 && ['cards', 'objects'].includes(collection.type)) {
        const cards: Record<string, w.CardInGame> = fromPairs((chosen as Array<w.CardInGame | w.Object>).map((c: w.CardInGame | w.Object) =>
          g.isObject(c) ? [c.card.name, c.card] : [c.name, c])
        );
        const names = Object.keys(cards).map((name) => `|${name}|`);
        const explanationStr = `${arrayToSentence(names)} ${chosen.length === 1 ? 'was' : 'were'} selected`;
        logAction(state, null, explanationStr, cards);
      }

      return {type: collection.type, entries: chosen} as w.Collection as T;
    },

    self: (): w.PlayerCollection => {
      if (currentObject) {
        return {type: 'players', entries: [ownerOf(state, currentObject)!]};
      } else {
        return {type: 'players', entries: [currentPlayer(state)]};
      }
    },

    // Currently salient object (prioritizing object ("undergoer") over subject ("agent")).
    // e.g. contrast:
    //     Whenever this robot attacks a robot, it gains two health.
    //     ("it" is ambiguous, but we treat it as the subject)
    // with:
    //     Whenever this robot attacks a robot, destroy that robot.
    //     ("that robot" clearly refers to the object)
    that: (): w.ObjectCollection | w.CardInHandCollection => {
      if (state.that) {
        return { type: 'objects', entries: [state.that] };
      } else if (state.it) {
        if (g.isObject(state.it)) {
          return { type: 'objects', entries: [state.it] };
        } else {
          return { type: 'cards', entries: [state.it] };
        }
      } else {
        return { type: 'objects', entries: [] };
      }
    },

    // Prioritize current iteratee in a collection of objects.
    // e.g. "Set the attack of all robots to *their* health."
    they: (): ((state: w.GameState) => w.ObjectCollection) => {
      // Wrap it as a function of state because this needs to be evaluated as late as possible.
      return (currentState: w.GameState) => {
        const they = currentState.currentEntryInCollection;
        if (they && g.isObject(they)) {
          return ({ type: 'objects', entries: [they] });
        } else {
          return ({ type: 'objects', entries: compact([currentState.it as w.Object | undefined]) });
        }
      };
    },

    // Prioritize current iteratee in a collection of players.
    // e.g. "Set the attack of all robots to *their* health."
    theyP: (): w.PlayerCollection => {
      const they = state.currentEntryInCollection;
      console.log(they);
      if (they && g.isPlayerState(they)) {
        return ({ type: 'players', entries: [they] });
      } else {
        return ({ type: 'players', entries: compact([state.itP]) });
      }
    },

    thisRobot: (): w.ObjectCollection => {
      return {type: 'objects', entries: [currentObject!]};
    }
  };
}
