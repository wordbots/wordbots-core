import React, { Component } from 'react';
import { array, func, object } from 'prop-types';

import { MODE_TUTORIAL } from '../../constants';

import LobbyStatus from './LobbyStatus';
import Waiting from './Waiting';
import CustomLobby from './CustomLobby';
import ModeSelection from './ModeSelection';

export default class Lobby extends Component {
  static propTypes = {
    socket: object,
    availableDecks: array,
    cards: array,

    onConnect: func,
    onJoinGame: func,
    onSpectateGame: func,
    onHostGame: func,
    onStartTutorial: func
  };

  constructor(props) {
    super(props);

    this.state = {
      gameMode: null
    };
  }

  selectMode = (mode) => {
    if (mode === MODE_TUTORIAL) {
      this.props.onStartTutorial();
    } else {
      this.setState({ gameMode: mode });
    }
  }

  renderGameModeSelection() {
    const skt = this.props.socket;

    if (this.state.gameMode) {
      switch(this.state.gameMode) {
        case 0:
          break;
        case 1:
          return (
            skt.hosting ?
              <Waiting /> :
              <CustomLobby
                socket={this.props.socket}
                availableDecks={this.props.availableDecks}
                cards={this.props.cards}
                onJoinGame={this.props.onJoinGame}
                onSpectateGame={this.props.onSpectateGame}
                onHostGame={this.props.onHostGame} />
          );
        case 2:
          break;
        case 3:
          break;
      }
    } else {
      return (
        <ModeSelection onSelectMode={this.selectMode}/>
      );
    }
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
        {this.renderGameModeSelection()}
      </div>
    );
  }
}
