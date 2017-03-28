import { cloneDeep } from 'lodash';

import * as socketActions from '../actions/socket';
import defaultState from '../store/defaultSocketState';

export default function socket(oldState = cloneDeep(defaultState), action) {
  const state = Object.assign({}, oldState);

  switch (action.type) {
    case socketActions.INFO:
      return Object.assign(state, {
        waitingPlayers: action.payload.waitingPlayers,
        numPlayersOnline: action.payload.playersOnline.length
      });

    case socketActions.HOST:
      return Object.assign(state, {hosting: true});

    default:
      return state;
  }
}
