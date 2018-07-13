import { cloneDeep, concat } from 'lodash';

import * as socketActions from '../actions/socket';
import defaultState from '../store/defaultSocketState.ts';

export default function socket(oldState = cloneDeep(defaultState), action) {
  const state = Object.assign({}, oldState);

  switch (action.type) {
    case socketActions.CONNECTING:
      return Object.assign(state, {connected: false, connecting: true});

    case socketActions.CONNECTED:
      return Object.assign(state, {connected: true, connecting: false});

    case socketActions.DISCONNECTED:
      return Object.assign(state, {connected: false, connecting: false});

    case socketActions.CHAT: {
      const message = {
        user: action.payload.sender ?
          (state.userDataByClientId[action.payload.sender] ?
            state.userDataByClientId[action.payload.sender].displayName :
            action.payload.sender) :
          'You',
        text: action.payload.msg,
        timestamp: Date.now()
      };

      return Object.assign(state, {
        chatMessages: concat(state.chatMessages, [message])
      });
    }

    case socketActions.INFO:
      return Object.assign(state, {
        games: action.payload.games,
        waitingPlayers: action.payload.waitingPlayers,
        userDataByClientId: action.payload.userData,
        playersOnline: action.payload.playersOnline,
        queueSize: action.payload.queueSize
      });

    case socketActions.GAME_START:
      return Object.assign(state, {hosting: false});

    case socketActions.HOST:
      return Object.assign(state, {gameName: action.payload.name, hosting: true});

    case socketActions.CANCEL_HOSTING:
      return Object.assign(state, {gameName: null, hosting: false});

    case socketActions.JOIN:
      return Object.assign(state, {gameName: action.payload.name});

    case socketActions.JOIN_QUEUE:
      return Object.assign(state, {queuing: true});

    case socketActions.LEAVE_QUEUE:
      return Object.assign(state, {queuing: false});

    case socketActions.SPECTATE:
      return Object.assign(state, {gameName: action.payload.name});

    case socketActions.LEAVE:
      return Object.assign(state, {gameName: null});

    default:
      return state;
  }
}
