import React, { Component } from 'react';
import { array, func, object } from 'prop-types';

import CustomLobby from './CustomLobby';
import LobbyStatus from './LobbyStatus';
import Waiting from './Waiting';

export default class Lobby extends Component {
  static propTypes = {
    socket: object,
    availableDecks: array,
    cards: array,

    onConnect: func,
    onJoinGame: func,
    onSpectateGame: func,
    onHostGame: func
  };

  constructor(props) {
    super(props);

    this.state = {
      selectedDeck: this.props.availableDecks.length - 1
    };
  }

  render() {
    const skt = this.props.socket;

    return (
      <div>
        <LobbyStatus
          connecting={skt.connecting}
          connected={skt.connected}
          playersOnline={skt.playersOnline}
          usernameMap={skt.clientIdToUsername}
          onConnect={this.props.onConnect} />
        {
          skt.hosting ? 
            <Waiting /> : 
            <CustomLobby 
              availableDecks={this.props.availableDecks}
              cards={this.props.cards}
              onJoinGame={this.props.onJoinGame}
              onSpectateGame={this.props.onSpectateGame}
              onHostGame={this.props.onHostGame} />
        }
      </div>
    );
  }
}
