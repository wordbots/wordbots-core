import { cloneDeep, concat } from 'lodash';

import * as w from '../types';
import * as socketActions from '../actions/socket';
import defaultState from '../store/defaultSocketState';

type State = w.SocketState;

export default function socket(oldState: State = cloneDeep(defaultState), action: w.Action): State {
  const state: State = Object.assign({}, oldState);

  switch (action.type) {
    case socketActions.CONNECTING:
      return Object.assign(state, {connected: false, connecting: true});

    case socketActions.CONNECTED:
      return Object.assign(state, {connected: true, connecting: false});

    case socketActions.DISCONNECTED:
      return Object.assign(state, {connected: false, connecting: false});

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

      return Object.assign(state, {
        chatMessages: concat(chatMessages, [message])
      });
    }

    case socketActions.CLIENT_ID:
      return Object.assign(state, {clientId: action.payload.clientID});

    case socketActions.INFO:
      return Object.assign(state, {
        games: action.payload.games,
        waitingPlayers: action.payload.waitingPlayers,
        userDataByClientId: action.payload.userData,
        playersOnline: action.payload.playersOnline,
        queueSize: action.payload.queueSize
      });

    case socketActions.GAME_START:
      return Object.assign(state, {hosting: false, queuing: false});

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
