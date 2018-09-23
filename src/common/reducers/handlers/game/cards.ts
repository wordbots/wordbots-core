import { cloneDeep, compact, isArray } from 'lodash';

import * as w from '../../../types';
import { TYPE_EVENT } from '../../../constants';
import { id } from '../../../util/common';
import {
  currentPlayer, getCost, checkVictoryConditions, matchesType,
  allHexIds, validPlacementHexes,
  triggerSound, discardCards,
  removeCardsFromHand, logAction, setTargetAndExecuteQueuedAction,
  executeCmd, triggerEvent, applyAbilities
} from '../../../util/game';
import { assertCardVisible, splitSentences } from '../../../util/cards';
import HexUtils from '../../../components/hexgrid/HexUtils';

type State = w.GameState;
type PlayerState = w.PlayerInGameState;

export function setSelectedCard(state: State, playerName: w.PlayerColor, cardIdx: number): State {
  const player: PlayerState = state.players[playerName];
  const isCurrentPlayer = (playerName === state.currentTurn);
  const selectedCard: w.CardInGame = assertCardVisible(player.hand[cardIdx]);
  const energy = player.energy;

  player.selectedTile = null;

  if (isCurrentPlayer &&
      player.target.choosing &&
      player.target.possibleCards.includes(selectedCard.id) &&
      (player.selectedCard !== null || state.callbackAfterTargetSelected !== null)) {
    // Target chosen for a queued action.
    return setTargetAndExecuteQueuedAction(state, selectedCard);
  } else if (player.selectedCard === cardIdx) {
    // Clicked on already selected card => Deselect.
    player.selectedCard = null;
    player.status.message = '';
    player.target.choosing = false;
  } else if (isCurrentPlayer) {
    // Try to play the chosen card.
    if (getCost(selectedCard) <= energy.available || state.sandbox) {
      if (selectedCard.type === TYPE_EVENT) {
        return playEvent(state, cardIdx);
      } else {
        player.selectedCard = cardIdx;
        player.target.choosing = false; // Reset targeting state.
        player.status = { type: 'text', message: 'Select an available tile to play this card.' };
      }
    } else {
      player.selectedCard = cardIdx;
      player.status = { type: 'error', message: 'You do not have enough energy to play this card.' };
    }
  }

  return state;
}

export function placeCard(state: State, cardIdx: number, tile: w.HexId): State {
  // Work on a copy of the state in case we have to rollback
  // (if a target needs to be selected for an afterPlayed trigger).
  let tempState: State = cloneDeep(state);

  const player: PlayerState = currentPlayer(tempState);
  const card: w.CardInGame = assertCardVisible(player.hand[cardIdx]);
  const timestamp = Date.now();

  if ((player.energy.available >= getCost(card) || state.sandbox) &&
      validPlacementHexes(state, player.name, card.type).map(HexUtils.getID).includes(tile)) {
    const playedObject: w.Object = {
      id: id(),
      card,
      type: card.type,
      stats: Object.assign({}, card.stats),
      triggers: [],
      abilities: [],
      movesMade: 0,
      cantMove: true,
      cantAttack: true,
      cantActivate: true,
      justPlayed: true  // This flag is needed to, e.g. prevent objects from being able to
                        // target themselves for afterPlayed triggers.
    };
    const target = player.target.chosen ? player.target.chosen[0] : null;

    player.robotsOnBoard[tile] = playedObject;
    if (!state.sandbox) {
      player.energy.available -= getCost(card);
    }
    player.selectedCard = null;
    player.status.message = '';
    player.selectedTile = tile;

    tempState = triggerSound(tempState, 'spawn.wav');
    tempState = logAction(tempState, player, `played |${card.name}|`, {[card.name]: card}, timestamp, target);

    if (card.abilities && card.abilities.length > 0) {
      card.abilities.forEach((cmd, idx) => {
        const cmdText = splitSentences(card.text || '')[idx];
        tempState.currentCmdText = cmdText.includes('"') ? cmdText.split('"')[1].replace(/"/g, '') : cmdText;
        executeCmd(tempState, cmd, playedObject);
      });
    }

    tempState = triggerEvent(tempState, 'afterPlayed', {object: playedObject});

    playedObject.justPlayed = false;

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
    tempState = logAction(tempState, player, `played |${card.name}|`, {[card.name]: card}, timestamp, target);
    tempState.eventExecuting = true;

    const commands: string[] = compact(isArray(card.command) ? card.command : [card.command]);
    commands.forEach((cmd, idx) => {
      const cmdText = splitSentences(card.text || '')[idx];
      if (!player.target.choosing) {
        tempState.currentCmdText = cmdText.includes('"') ? cmdText.split('"')[1].replace(/"/g, '') : cmdText;
        executeCmd(tempState, cmd);
      }
    });

    tempState.eventExecuting = false;

    if (player.target.choosing) {
      // Target still needs to be selected, so roll back playing the card (and return old state).
      state.callbackAfterTargetSelected = ((newState: State) => playEvent(newState, cardIdx));
      currentPlayer(state).selectedCard = cardIdx;
      currentPlayer(state).target = player.target;
      currentPlayer(state).status = {message: `Choose a target for ${card.name}.`, type: 'text'};
    } else if (tempState.invalid) {
      // Temp state is invalid (e.g. no valid target available or player unable to pay an energy cost).
      // So return the old state.
      // This must come after the `choosing` case to allow multiple target selection,
      // but *before* the `!chosen` case to correctly handle the case where no target is available.
      currentPlayer(state).selectedCard = cardIdx;
      currentPlayer(state).status = {message: `Unable to play ${card.name}!`, type: 'error'};
    } else if (!player.target.chosen) {
      // If there is no target selection, that means that this card is a global effect.
      // In that case, the player needs to "target" the board to confirm that they want to play the event.
      state.callbackAfterTargetSelected = ((newState: State) => playEvent(newState, cardIdx));
      currentPlayer(state).selectedCard = cardIdx;
      currentPlayer(state).target = { choosing: true, chosen: null, possibleCards: [], possibleHexes: allHexIds() };
      currentPlayer(state).status = {message: `Click anywhere on the board to play ${card.name}.`, type: 'text'};
    } else {
      // Everything is good (valid state + no more targets to select), so we can return the new state!
      card.justPlayed = false;

      tempState = discardCards(tempState, currentPlayer(state).name, [card]);
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

      tempState.eventQueue = [...tempState.eventQueue, card];

      return tempState;
    }
  }

  return state;
}
