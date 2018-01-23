import { cloneDeep, isArray } from 'lodash';

import { TYPE_EVENT, stringToType } from '../../../constants';
import { id } from '../../../util/common';
import {
  currentPlayer, getCost, checkVictoryConditions,
  allHexIds, validPlacementHexes,
  triggerSound, discardCards,
  removeCardsFromHand, logAction, setTargetAndExecuteQueuedAction,
  executeCmd, triggerEvent, applyAbilities
} from '../../../util/game';
import { splitSentences } from '../../../util/cards';
import HexUtils from '../../../components/hexgrid/HexUtils';

export function setSelectedCard(state, playerName, cardIdx) {
  const player = state.players[playerName];
  const isCurrentPlayer = (playerName === state.currentTurn);
  const selectedCard = player.hand[cardIdx];
  const energy = player.energy;

  player.selectedTile = null;

  if (isCurrentPlayer &&
      player.target.choosing &&
      player.target.possibleCards.includes(selectedCard.id) &&
      (player.selectedCard !== null || state.callbackAfterTargetSelected !== null)) {
    // Target chosen for a queued action.
    return setTargetAndExecuteQueuedAction(state, selectedCard);
  } else {
    // Toggle card selection.
    if (isCurrentPlayer && selectedCard.type === TYPE_EVENT && getCost(selectedCard) <= energy.available) {
      // Clicked on playable event => Play the event
      return playEvent(state, cardIdx);
    } else if (player.selectedCard === cardIdx) {
      // Clicked on already selected card => Deselect
      player.selectedCard = null;
      player.status.message = '';
    } else {
      // Clicked on unselected card => Select

      player.selectedCard = cardIdx;
      player.target.choosing = false; // Reset targeting state.

      if (getCost(selectedCard) <= energy.available) {
        player.status.message = (selectedCard.type === TYPE_EVENT) ? 'Click this event again to play it.' : 'Select an available tile to play this card.';
        player.status.type = 'text';
      } else {
        player.status.message = 'You do not have enough energy to play this card.';
        player.status.type = 'error';
      }
    }

    return state;
  }
}

export function placeCard(state, cardIdx, tile) {
  // Work on a copy of the state in case we have to rollback
  // (if a target needs to be selected for an afterPlayed trigger).
  let tempState = cloneDeep(state);

  const player = currentPlayer(tempState);
  const card = player.hand[cardIdx];
  const timestamp = Date.now();

  if (player.energy.available >= getCost(card) &&
      validPlacementHexes(state, player.name, card.type).map(HexUtils.getID).includes(tile)) {
    const playedObject = {
      id: id(),
      card: card,
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
    player.energy.available -= getCost(card);
    player.selectedCard = null;
    player.status.message = '';
    player.selectedTile = tile;

    tempState = triggerSound(tempState, 'spawn.wav');
    tempState = logAction(tempState, player, `played |${card.name}|`, {[card.name]: card}, timestamp, target);

    if (card.abilities && card.abilities.length > 0) {
      card.abilities.forEach((cmd, idx) => {
        const cmdText = splitSentences(card.text)[idx];
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

      state.callbackAfterTargetSelected = (newState => placeCard(newState, cardIdx, tile));
      return state;
    } else {
      tempState = removeCardsFromHand(tempState, [card]);
      tempState = triggerEvent(tempState, 'afterCardPlay', {
        player: true,
        condition: t => stringToType(t.cardType) === card.type || t.cardType === 'allobjects',
        undergoer: playedObject
      });
      tempState = applyAbilities(tempState);

      return tempState;
    }
  } else {
    return state;
  }
}

function playEvent(state, cardIdx) {
  // Work on a copy of the state in case we have to rollback
  // (if a target needs to be selected for an afterPlayed trigger).
  let tempState = cloneDeep(state);

  const player = currentPlayer(tempState);
  const card = player.hand[cardIdx];
  const timestamp = Date.now();

  if (player.energy.available >= getCost(card)) {
    // Cards cannot target themselves, so temporarily set justPlayed = true before executing the command.
    card.justPlayed = true;

    const target = player.target.chosen ? player.target.chosen[0] : null;

    tempState = triggerSound(tempState, 'event.wav');
    tempState = logAction(tempState, player, `played |${card.name}|`, {[card.name]: card}, timestamp, target);
    tempState.eventExecuting = true;

    (isArray(card.command) ? card.command : [card.command]).forEach((cmd, idx) => {
      const cmdText = splitSentences(card.text)[idx];
      if (!player.target.choosing) {
        tempState.currentCmdText = cmdText.includes('"') ? cmdText.split('"')[1].replace(/"/g, '') : cmdText;
        executeCmd(tempState, cmd);
      }
    });

    tempState.eventExecuting = false;

    if (player.target.choosing) {
      // Target still needs to be selected, so roll back playing the card (and return old state).

      state.callbackAfterTargetSelected = (newState => playEvent(newState, cardIdx));
      currentPlayer(state).selectedCard = cardIdx;
      currentPlayer(state).target = player.target;
      currentPlayer(state).status = {message: `Choose a target for ${card.name}.`, type: 'text'};

      return state;
    } else if (tempState.invalid) {
      // Temp state is invalid (e.g. no valid target available or player unable to pay an energy cost).
      // So return the old state.
      // This must come after the `choosing` case to allow multiple target selection,
      // but *before* the `!chosen` case to correctly handle the case where no target is availabl.e
      currentPlayer(state).selectedCard = cardIdx;
      currentPlayer(state).status = {message: `Unable to play ${card.name}!`, type: 'error'};
      return state;
    } else if (!player.target.chosen) {
      // If there is no target selection, that means that this card is a global effect.
      // In that case, the player needs to "target" the board to confirm that they want to play the event.

      state.callbackAfterTargetSelected = (newState => playEvent(newState, cardIdx));
      currentPlayer(state).selectedCard = cardIdx;
      currentPlayer(state).target = { choosing: true, chosen: null, possibleCards: [], possibleHexes: allHexIds() };
      currentPlayer(state).status = {message: `Click anywhere on the board to play ${card.name}.`, type: 'text'};

      return state;
    } else {
      card.justPlayed = false;

      tempState = discardCards(tempState, currentPlayer(state).name, [card]);
      tempState = triggerEvent(tempState, 'afterCardPlay', {
        player: true,
        condition: t => stringToType(t.cardType) === TYPE_EVENT || t.cardType === 'allobjects'
      });
      tempState = applyAbilities(tempState);
      tempState = checkVictoryConditions(tempState);

      player.status.message = '';
      player.selectedCard = null;
      player.energy.available -= getCost(card);

      tempState.eventQueue = [...tempState.eventQueue, card];

      return tempState;
    }
  } else {
    return state;
  }
}
