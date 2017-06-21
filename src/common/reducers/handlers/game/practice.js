import { cloneDeep, findIndex, sample } from 'lodash';

import { TYPE_EVENT } from '../../../constants';
import { validPlacementHexes, passTurn } from '../../../util/game';
import { collection } from '../../../store/cards';
import defaultState from '../../../store/defaultGameState';
import HexUtils from '../../../components/react-hexgrid/HexUtils';

import { setSelectedCard, placeCard } from './cards';

export function startPractice(state) {
  // Reset game state and enable tutorial mode.
  state = Object.assign(state, cloneDeep(defaultState), {
    started: true,
    practice: true,
    usernames: {orange: 'Human', blue: 'Computer'}
  });

  // Set up.
  state.players.orange.deck = collection.slice(2, 30);
  state.players.orange.hand = collection.slice(0, 2);
  state.players.blue.deck = collection.slice(2, 30);
  state.players.blue.hand = collection.slice(0, 2);

  return state;
}

export function aiResponse(state) {
  if (state.usernames[state.currentTurn] !== 'Computer') {
    return state;
  }

  const rnd = Math.random();

  if (rnd < 0.05) {
    return passTurn(state, state.currentTurn);
  } else if (rnd < 0.50) {
    return tryToPlayCard(state);
  } else {
    return tryToMoveRobot(state);
  }
}

function tryToPlayCard(state) {
  const ai = state.players[state.currentTurn];
  const playableCards = ai.hand.filter(c => c.cost <= ai.energy.available);

  if (playableCards.length > 0) {
    const card = sample(playableCards);
    const idx = findIndex(ai.hand, {id: card.id});

    state = setSelectedCard(state, ai.name, idx);

    if (card.type === TYPE_EVENT) {
      // Play event by "clicking twice".
      state = setSelectedCard(state, ai.name, idx);
    } else {
      const validHexes = validPlacementHexes(state, ai.name, card.type);
      if (validHexes.length > 0) {
        state = placeCard(state, idx, HexUtils.getID(sample(validHexes)));
      }
    }
  }

  return state;
}

function tryToMoveRobot(state) {
  return state;
}
