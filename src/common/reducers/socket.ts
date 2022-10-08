import { cloneDeep, concat } from 'lodash';

import * as socketActions from '../actions/socket';
import defaultState from '../store/defaultSocketState';
import * as w from '../types';

type State = w.SocketState;

export default function socket(oldState: State = cloneDeep(defaultState), action: w.Action): State {
  const state: State = { ...oldState };

  switch (action.type) {
    case socketActions.CONNECTING:
      return { ...state, connected: false, connecting: true };

    case socketActions.CONNECTED:
      return { ...state, connected: true, connecting: false };

    case socketActions.DISCONNECTED:
      // Clear chatMessages if the user left deliberately
      return { ...state, connected: false, connecting: false, chatMessages: action.payload.left ? [] : state.chatMessages };

    case socketActions.CHAT: {
      const { chatMessages, userDataByClientId: userDataMap } = state;
      const { sender, msg } = action.payload;

      const message: w.ChatMessage = {
        user: sender ?
          (userDataMap[sender] ? userDataMap[sender].displayName : sender) :
          'You',
        text: msg,
        timestamp: Date.now()
      };

      return {
        ...state,
        chatMessages: concat(chatMessages, [message])
      };
    }

    case socketActions.CLIENT_ID:
      return { ...state, clientId: action.payload.clientID };

    case socketActions.INFO:
      return {
        ...state,
        games: action.payload.games,
        waitingPlayers: action.payload.waitingPlayers,
        userDataByClientId: action.payload.userData,
        playersOnline: action.payload.playersOnline,
        queueSize: action.payload.queueSize
      };

    case socketActions.GAME_START:
      return { ...state, hosting: false, queuing: false };

    case socketActions.HOST:
      return { ...state, gameName: action.payload.name, hosting: true };

    case socketActions.CANCEL_HOSTING:
      return { ...state, gameName: null, hosting: false };

    case socketActions.JOIN:
      return { ...state, gameName: action.payload.name };

    case socketActions.JOIN_QUEUE:
      return { ...state, queuing: true };

    case socketActions.LEAVE_QUEUE:
      return { ...state, queuing: false };

    case socketActions.SPECTATE:
      return { ...state, gameName: action.payload.name };

    case socketActions.LEAVE:
      return { ...state, gameName: null };

    default:
      return state;
  }
}
