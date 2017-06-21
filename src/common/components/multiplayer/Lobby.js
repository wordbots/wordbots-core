import React, { Component } from 'react';
import { array, func, object, string } from 'prop-types';

import LobbyStatus from './LobbyStatus';
import Waiting from './Waiting';
import CasualLobby from './CasualLobby';
import ModeSelection from './ModeSelection';

export default class Lobby extends Component {
  static propTypes = {
    socket: object,
    gameMode: string,
    availableDecks: array,
    cards: array,

    onConnect: func,
    onJoinGame: func,
    onSpectateGame: func,
    onHostGame: func,
    onStartTutorial: func,
    onSelectMode: func
  };

  renderGameModeSelection() {
    if (this.props.gameMode === '/casual') {
      if (this.props.socket.hosting) {
        return <Waiting />;
      } else {
        return (
          <CasualLobby
            socket={this.props.socket}
            availableDecks={this.props.availableDecks}
            cards={this.props.cards}
            onJoinGame={this.props.onJoinGame}
            onSpectateGame={this.props.onSpectateGame}
            onHostGame={this.props.onHostGame} />
        );
      }
    } else {
      return <ModeSelection onSelectMode={this.props.onSelectMode}/>;
    }
  }

  render() {
    const skt = this.props.socket;

    return (
      <div style={{padding: '48px 72px'}}>
        <LobbyStatus
          connecting={skt.connecting}
          connected={skt.connected}
          playersOnline={skt.playersOnline}
          usernameMap={skt.clientIdToUsername}
          onConnect={this.props.onConnect} />
        {this.renderGameModeSelection()}
      </div>
    );
  }
}
