import { cloneDeep } from 'lodash';

import { passTurn } from '../../../util/game';
import { collection } from '../../../store/cards';
import defaultState from '../../../store/defaultGameState';

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

  const rand = Math.random();
  console.log(rand);
  return rand < 0.2 ? passTurn(state, state.currentTurn) : state;
}
