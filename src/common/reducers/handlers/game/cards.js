import { TYPE_EVENT } from '../../../constants';
import { currentPlayer, validPlacementHexes, getCost, executeCmd, checkTriggers, applyAbilities } from '../../../util';
import HexUtils from '../../../components/react-hexgrid/HexUtils';

export function setSelectedCard(state, cardIdx) {
  const selectedCard = state.players[state.currentTurn].hand[cardIdx];
  const energy = state.players[state.currentTurn].energy;

  state.selectedTile = null;

  if (state.target.choosing && state.target.possibleCards.includes(selectedCard.id) && !_.isNull(state.selectedCard)) {
    // Select target card for event or afterPlayed trigger.
    state.target = Object.assign({}, state.target, {
      chosen: [selectedCard],
      choosing: false,
      possibleCards: []
    });

    const playedCard = state.players[state.currentTurn].hand[state.selectedCard];

    if (playedCard.type == TYPE_EVENT) {
      return playEvent(state, state.selectedCard);
    } else {
      return placeCard(state, playedCard, state.placementTile);
    }
  } else {
    // Toggle card selection.

    if (state.selectedCard == cardIdx) {
      // Clicked on already selected card => Deselect or play event

      if (selectedCard.type === TYPE_EVENT && getCost(selectedCard) <= energy.available) {
        return playEvent(state, cardIdx);
      } else {
        state.selectedCard = null;
        state.playingCardType = null;
        state.status.message = '';
      }
    } else {
      // Clicked on unselected card => Select

      state.selectedCard = cardIdx;
      state.target.choosing = false; // Reset targeting state.

      if (getCost(selectedCard) <= energy.available) {
        state.playingCardType = selectedCard.type;
        state.status.message = (selectedCard.type === TYPE_EVENT) ? 'Click this event again to play it.' : 'Select an available tile to play this card.';
        state.status.type = 'text';
      } else {
        state.playingCardType = null;
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
  let tempState = _.cloneDeep(state);

  const player = currentPlayer(tempState);
  const selectedCardIndex = tempState.selectedCard;

  if (player.energy.available >= getCost(card) &&
      validPlacementHexes(state, player.name, card.type).map(HexUtils.getID).includes(tile)) {
    const playedObject = {
      id: Math.random().toString(36),
      card: card,
      stats: Object.assign({}, card.stats),
      triggers: [],
      movesLeft: 0,
      justPlayed: true  // This flag is needed to, e.g. prevent objects from being able to
                        // target themselves for afterPlayed triggers.
    };

    player.robotsOnBoard[tile] = playedObject;

    player.energy.available -= getCost(card);
    player.hand.splice(selectedCardIndex, 1);

    if (card.abilities.length > 0) {
      card.abilities.forEach((cmd) => executeCmd(tempState, cmd, playedObject));
    }

    tempState = checkTriggers(tempState, 'afterPlayed', playedObject, (trigger =>
      trigger.objects.map(o => o.id).includes(playedObject.id)
    ));

    tempState = applyAbilities(tempState);

    playedObject.justPlayed = false;

    tempState.selectedCard = null;
    tempState.playingCardType = null;
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
  const selectedCard = state.players[state.currentTurn].hand[cardIdx];

  if (_.isArray(selectedCard.command)) {
    selectedCard.command.forEach((cmd) => executeCmd(state, cmd));
  } else {
    executeCmd(state, selectedCard.command);
  }

  if (state.target.choosing) {
    state.status = { message: `Choose a target for ${selectedCard.name}.`, type: 'text' };
  } else {
    state.selectedCard = null;
    state.playingCardType = null;
    state.status.message = '';

    const player = state.players[state.currentTurn];
    player.energy.available -= getCost(selectedCard);
    player.hand.splice(cardIdx, 1);
  }

  return state;
}
