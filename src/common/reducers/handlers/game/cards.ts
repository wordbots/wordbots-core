import { cloneDeep, compact, isArray } from 'lodash';
import { shuffle } from 'seed-shuffle';

import HexUtils from '../../../components/hexgrid/HexUtils';
import { TYPE_EVENT } from '../../../constants';
import * as g from '../../../guards';
import { bluePlayerState, orangePlayerState } from '../../../store/defaultGameState';
import * as w from '../../../types';
import { assertCardVisible, quoteKeywords, splitSentences } from '../../../util/cards';
import { id, nextSeed } from '../../../util/common';
import {
  allHexIds, applyAbilities, checkVictoryConditions, currentPlayer,
  deleteAllDyingObjects, discardCardsFromHand, executeCmd, getCost, logAction,
  matchesType, removeCardsFromHand, setTargetAndExecuteQueuedAction,
  triggerEvent, triggerSound, validPlacementHexes
} from '../../../util/game';

type State = w.GameState;
type PlayerState = w.PlayerInGameState;

export function setSelectedCard(state: State, playerName: w.PlayerColor, cardIdx: number): State {
  const player: PlayerState = state.players[playerName];
  const isCurrentPlayer = (playerName === state.currentTurn);
  const selectedCard: w.PossiblyObfuscatedCard = player.hand[cardIdx];
  const energy = player.energy;

  player.selectedTile = null;

  if (isCurrentPlayer &&
    player.target.choosing &&
    player.target.possibleCardsInHand.includes(selectedCard.id) &&
    (player.selectedCard !== null || state.callbackAfterTargetSelected !== null)) {
    // Target chosen for a queued action.
    return setTargetAndExecuteQueuedAction(state, assertCardVisible(selectedCard));
  } else if (player.selectedCard === cardIdx) {
    // Clicked on already selected card => Deselect.
    player.selectedCard = null;
    player.status.message = '';
    player.target.choosing = false;
  } else if (isCurrentPlayer) {
    player.target.choosing = false; // Reset targeting state.

    // Try to play the chosen card.
    if (g.isCardVisible(selectedCard) && (getCost(selectedCard) <= energy.available || state.sandbox)) {
      if (selectedCard.type === TYPE_EVENT) {
        return playEvent(state, cardIdx);
      } else {
        player.selectedCard = cardIdx;
        player.status = { type: 'text', message: 'Select an available tile to play this card.' };
      }
    } else {
      player.selectedCard = cardIdx;
      player.status = { type: 'error', message: 'You do not have enough energy to play this card.' };
    }
  }

  return state;
}

export function setSelectedCardInDiscardPile(state: State, playerName: w.PlayerColor, cardId: w.CardId): State {
  const player: PlayerState = state.players[playerName];
  const isCurrentPlayer = (playerName === state.currentTurn);
  const selectedCard: w.CardInGame | undefined = player.discardPile.find((card) => card.id === cardId);

  player.selectedTile = null;

  if (isCurrentPlayer &&
    player.target.choosing &&
    selectedCard &&
    player.target.possibleCardsInDiscardPile.includes(selectedCard.id) &&
    (player.selectedCard !== null || state.callbackAfterTargetSelected !== null)) {
    // Target chosen for a queued action.
    return setTargetAndExecuteQueuedAction(state, selectedCard);
  }

  return state;
}

// Create an Object from a card being played.
export function instantiateObject(card: w.CardInGame): w.Object {
  return {
    id: id(),
    card,
    type: card.type,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    stats: { ...card.stats! },
    triggers: [],
    abilities: [],
    effects: [],
    movesMade: 0,
    cantMove: true,
    cantAttack: true,
    cantActivate: true,
    justPlayed: true  // This flag is needed to, e.g. prevent objects from being able to
    // target themselves for afterPlayed triggers.
  };
}

// This method is used to populate state.currentCmdText
function getCommandTextForDisplay(cmdText: string): string {
  // If cmdText is of the form `Some object gets "blah blah blah ability"` (i.e. exactly two " characters delimiting an ability),
  // pull out just the ability text that is quoted.
  if (cmdText.includes('"') && cmdText.split('"').length === 3) {
    return cmdText.split('"')[1].replace(/"/g, '');
  } else {
    return cmdText;
  }
}

// Handles things that should happen after an object is played or spawned (using actions.spawnObject).
export function afterObjectPlayed(state: State, playedObject: w.Object): State {
  const player: PlayerState = currentPlayer(state);
  const target = (player.target.choosing && player.target.chosen) ? player.target.chosen[0] : null;
  const { card } = playedObject;
  const timestamp = Date.now();

  state = triggerSound(state, 'spawn.wav');
  state = logAction(state, player, `played |${card.id}|`, { [card.id]: card }, timestamp, target);
  state.memory = {};  // Clear any previously set memory in the state.

  if (card.abilities && card.abilities.length > 0) {
    card.abilities.forEach((cmd, idx) => {
      const cmdText = quoteKeywords(splitSentences(card.text || '')[idx]);
      state.currentCmdText = getCommandTextForDisplay(cmdText);

      try {
        executeCmd(state, cmd, playedObject);
      } catch (error) {
        // TODO better error handling: throw a custom Error object that we handle in the game reducer?
        console.error(error);
        alert(`Oops!\n\n${error}`);
        throw error;
      }
    });
  }

  state = triggerEvent(state, 'afterPlayed', { object: playedObject });

  playedObject.justPlayed = false;

  return state;
}

export function placeCard(state: State, cardIdx: number, tile: w.HexId): State {
  // Work on a copy of the state in case we have to rollback
  // (if a target needs to be selected for an afterPlayed trigger).
  let tempState: State = cloneDeep(state);

  const player: PlayerState = currentPlayer(tempState);
  const card: w.CardInGame = assertCardVisible(player.hand[cardIdx]);

  if ((player.energy.available >= getCost(card) || state.sandbox) &&
    validPlacementHexes(state, player.color, card.type).map(HexUtils.getID).includes(tile)) {
    const playedObject: w.Object = instantiateObject(card);

    player.objectsOnBoard[tile] = playedObject;
    if (!state.sandbox) {
      player.energy.available -= getCost(card);
    }
    player.selectedCard = null;
    player.status.message = '';
    player.selectedTile = tile;

    tempState = afterObjectPlayed(tempState, playedObject);

    if (player.target.choosing) {
      // Target still needs to be selected, so roll back playing the card (and return old state).

      currentPlayer(state).target = player.target;
      currentPlayer(state).status = {
        message: `Choose a target for ${card.name}'s ability.`,
        type: 'text'
      };

      state.callbackAfterTargetSelected = ((newState: State) => placeCard(newState, cardIdx, tile));
      return state;
    } else {
      tempState = removeCardsFromHand(tempState, [card]);
      tempState = triggerEvent(tempState, 'afterCardPlay', {
        player: true,
        condition: (t: w.Trigger) => matchesType(card, t.cardType!),
        undergoer: playedObject
      });
      tempState = applyAbilities(tempState);
      tempState = deleteAllDyingObjects(tempState);

      return tempState;
    }
  } else {
    return state;
  }
}

function playEvent(state: State, cardIdx: number): State {
  // Work on a copy of the state in case we have to rollback
  // (if a target needs to be selected for an afterPlayed trigger).
  let tempState: State = cloneDeep(state);

  const player: PlayerState = currentPlayer(tempState);
  const card: w.CardInGame = assertCardVisible(player.hand[cardIdx]);
  const timestamp = Date.now();

  if (player.energy.available >= getCost(card) || state.sandbox) {
    // Cards cannot target themselves, so temporarily set justPlayed = true before executing the command.
    card.justPlayed = true;

    const target = player.target.chosen ? player.target.chosen[0] : null;

    tempState = triggerSound(tempState, 'event.wav');
    tempState = logAction(tempState, player, `played |${card.id}|`, { [card.id]: card }, timestamp, player.target.choosing && target || null);
    tempState.eventExecuting = true;
    tempState.memory = {};  // Clear any previously set memory in the state.

    const commands: string[] = compact(isArray(card.command) ? card.command : [card.command]);
    commands.forEach((cmd, idx) => {
      const cmdText = splitSentences(card.text || '')[idx];
      if (!player.target.choosing) {
        tempState.currentCmdText = getCommandTextForDisplay(cmdText);

        try {
          executeCmd(tempState, cmd);
        } catch (error) {
          // TODO better error handling: throw a custom Error object that we handle in the game reducer?
          console.error(error);
          alert(`Oops!\n\n${error}`);
          throw error;
        }
      }
    });

    tempState.eventExecuting = false;

    if (player.target.choosing) {
      // Target still needs to be selected, so roll back playing the card (and return old state).
      state.callbackAfterTargetSelected = ((newState: State) => playEvent(newState, cardIdx));
      currentPlayer(state).selectedCard = cardIdx;
      currentPlayer(state).target = player.target;
      currentPlayer(state).status = { message: `Choose a target for ${card.name}.`, type: 'text' };
    } else if (tempState.invalid) {
      // Temp state is invalid (e.g. no valid target available or player unable to pay an energy cost).
      // So return the old state.
      // This must come after the `choosing` case to allow multiple target selection,
      // but *before* the `!chosen` case to correctly handle the case where no target is available.
      currentPlayer(state).selectedCard = cardIdx;
      currentPlayer(state).status = { message: `Unable to play ${card.name}!`, type: 'error' };
    } else if (!player.target.chosen) {
      // If there is no target selection, that means that this card is a global effect.
      // In that case, the player needs to "target" the board to confirm that they want to play the event.
      state.callbackAfterTargetSelected = ((newState: State) => playEvent(newState, cardIdx));
      currentPlayer(state).selectedCard = cardIdx;
      currentPlayer(state).target = { choosing: true, chosen: null, possibleCardsInHand: [], possibleCardsInDiscardPile: [], possibleHexes: allHexIds() };
      currentPlayer(state).status = { message: `Click anywhere on the board to play ${card.name}.`, type: 'text' };
    } else {
      // Everything is good (valid state + no more targets to select), so we can return the new state!
      card.justPlayed = false;

      // Save the callbackAfterExecution from the state (if any), in case it gets messed up (i.e. by triggerEvent()).
      // We will call it *after* trigger/ability handling.
      const { callbackAfterExecution } = tempState;

      tempState = discardCardsFromHand(tempState, currentPlayer(state).color, [card]);
      tempState = triggerEvent(tempState, 'afterCardPlay', {
        player: true,
        condition: (t: w.Trigger) => matchesType(card, t.cardType!)
      });
      tempState = applyAbilities(tempState);
      tempState = checkVictoryConditions(tempState);

      player.status.message = '';
      player.selectedCard = null;
      if (!state.sandbox) {
        player.energy.available -= getCost(card);
      }

      if (callbackAfterExecution) {
        tempState = callbackAfterExecution(tempState);
      }

      tempState.eventQueue = [...tempState.eventQueue, card];

      return tempState;
    }
  }

  return state;
}

export function draftCards(state: w.GameState, player: w.PlayerColor, cards: w.CardInGame[]): w.GameState {
  // Play a sound when the active player selects cards to draft.
  if (state.player === player) {
    state = triggerSound(state, 'move.wav');
  }

  if (state.draft) {
    state.draft[player] = {
      cardsDrafted: [...state.draft[player].cardsDrafted, ...cards],
      cardGroupsToShow: state.draft[player].cardGroupsToShow.slice(1)
    };

    // Are both players done drafting? If so, let's assemble the decks and start the game!
    if (state.draft.blue.cardGroupsToShow.length === 0 && state.draft.orange.cardGroupsToShow.length === 0) {
      const seed = state.rng();
      const blueDeck: w.CardInGame[] = shuffle(state.draft.blue.cardsDrafted, seed);
      const orangeDeck: w.CardInGame[] = shuffle(state.draft.orange.cardsDrafted, nextSeed(seed));

      state.players.blue = bluePlayerState(blueDeck);
      state.players.orange = orangePlayerState(orangeDeck);
      state.draft = null;

      // Play game countdown only after the draft phrase is over
      // (note that it's not played on newGame in the SetDraft format)
      state = triggerSound(state, 'countdown.wav');
    }
  }

  return state;
}
