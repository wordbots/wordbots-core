import { cloneDeep, isArray } from 'lodash';

import { TYPE_EVENT } from '../../../constants';
import {
  currentPlayer, getCost, checkVictoryConditions,
  validPlacementHexes,
  discardCards,
  executeCmd, triggerEvent, applyAbilities
} from '../../../util/game';
import HexUtils from '../../../components/react-hexgrid/HexUtils';

export function setSelectedCard(state, playerName, cardIdx) {
  const player = state.players[playerName];
  const selectedCard = player.hand[cardIdx];
  const energy = player.energy;

  player.selectedTile = null;

  if (state.target.choosing &&
      state.target.possibleCards.includes(selectedCard.id) &&
      player.selectedCard !== null) {
    // Target chosen for a queued action.
    return setTargetAndExecuteQueuedAction(state, selectedCard);
  } else {
    // Toggle card selection.

    if (player.selectedCard === cardIdx) {
      // Clicked on already selected card => Deselect or play event

      if (selectedCard.type === TYPE_EVENT && getCost(selectedCard) <= energy.available) {
        return playEvent(state, cardIdx);
      } else {
        player.selectedCard = null;
        state.status.message = '';
      }
    } else {
      // Clicked on unselected card => Select

      player.selectedCard = cardIdx;
      state.target.choosing = false; // Reset targeting state.

      if (getCost(selectedCard) <= energy.available) {
        state.status.message = (selectedCard.type === TYPE_EVENT) ? 'Click this event again to play it.' : 'Select an available tile to play this card.';
        state.status.type = 'text';
      } else {
        state.status.message = 'You do not have enough energy to play this card.';
        state.status.type = 'error';
      }
    }

    return state;
  }
}

export function placeCard(state, card, tile) {
  // Work on a copy of the state in case we have to rollback
  // (if a target needs to be selected for an afterPlayed trigger).
  let tempState = cloneDeep(state);

  const player = currentPlayer(tempState);

  if (player.energy.available >= getCost(card) &&
      validPlacementHexes(state, player.name, card.type).map(HexUtils.getID).includes(tile)) {
    const playedObject = {
      id: Math.random().toString(36),
      card: card,
      stats: Object.assign({}, card.stats),
      triggers: [],
      movesMade: 0,
      cantMove: true,
      justPlayed: true  // This flag is needed to, e.g. prevent objects from being able to
                        // target themselves for afterPlayed triggers.
    };

    player.robotsOnBoard[tile] = playedObject;
    player.energy.available -= getCost(card);
    player.selectedCard = null;

    if (card.abilities.length > 0) {
      card.abilities.forEach((cmd) => executeCmd(tempState, cmd, playedObject));
    }

    tempState = discardCards(tempState, [card]);
    tempState = triggerEvent(tempState, 'afterPlayed', {object: playedObject});
    tempState = applyAbilities(tempState);

    playedObject.justPlayed = false;

    tempState.status.message = '';
  }

  if (tempState.target.choosing) {
    // Target still needs to be selected, so roll back playing the card (and return old state).
    return Object.assign({}, state, {
      status: { message: `Choose a target for ${card.name}'s ability.`, type: 'text' },
      target: tempState.target,
      placementTile: tile  // Store the tile the object was played on, for the actual placement later.
    });
  } else {
    // Apply abilities one more time, in case the current object needs to be targeted by any abilities.
    // Recall that the played object was previously marked as justPlayed, to prevent it from being able to target itself.
    tempState = applyAbilities(tempState);

    return tempState;
  }
}

export function playEvent(state, cardIdx, command) {
  const player = state.players[state.currentTurn];
  const card = player.hand[cardIdx];
  const cmd = card.command;

  if (player.energy.available >= getCost(card)) {
    // Cards cannot target themselves, so temporarily set justPlayed = true before executing the command.
    card.justPlayed = true;

    (isArray(cmd) ? cmd : [cmd]).forEach((subcmd) => {
      if (!state.target.choosing) {
        executeCmd(state, subcmd);
      }
    });

    card.justPlayed = false;

    if (state.target.choosing) {
      state.status = { message: `Choose a target for ${card.name}.`, type: 'text' };
    } else {
      state = discardCards(state, [card]);
      state.status.message = '';

      player.selectedCard = null;
      player.energy.available -= getCost(card);
    }
  }

  state = checkVictoryConditions(state);

  return state;
}

export function setTargetAndExecuteQueuedAction(state, target) {
  const player = state.players[state.currentTurn];

  // Select target tile for event or afterPlayed trigger.
  state.target = {
    chosen: [target],
    choosing: false,
    possibleHexes: [],
    possibleCards: []
  };

  // Perform the trigger.
  const card = player.hand[player.selectedCard];

  if (card.type === TYPE_EVENT) {
    state = playEvent(state, player.selectedCard);
  } else {
    state = placeCard(state, card, state.placementTile);
  }

  // Reset target.
  state.target = Object.assign(state.target, {choosing: false, chosen: null});
  return state;
}
