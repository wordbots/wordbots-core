import { cloneDeep } from 'lodash';

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
