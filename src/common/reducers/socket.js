import { cloneDeep, concat } from 'lodash';

import * as socketActions from '../actions/socket';
import defaultState from '../store/defaultSocketState';

export default function socket(oldState = cloneDeep(defaultState), action) {
  const state = Object.assign({}, oldState);

  switch (action.type) {
    case socketActions.CONNECTED:
      return Object.assign(state, {clientId: action.payload.clientId});

    case socketActions.CHAT: {
      const message = {
        user: action.payload.sender ? (state.clientIdToUsername[action.payload.sender] || action.payload.sender) : 'You',
        text: action.payload.msg
      };

      return Object.assign(state, {
        chatMessages: concat(state.chatMessages, [message])
      });
    }

    case socketActions.INFO:
      return Object.assign(state, {
        waitingPlayers: action.payload.waitingPlayers,
        clientIdToUsername: action.payload.usernames,
        playersOnline: action.payload.playersOnline
      });

    case socketActions.HOST:
      return Object.assign(state, {hosting: true});

    case socketActions.SET_USERNAME:
      return Object.assign(state, {username: action.payload.username});

    default:
      return state;
  }
}
