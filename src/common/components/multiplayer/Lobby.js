import React, { Component } from 'react';
import { array, func, object } from 'prop-types';
import { shuffle } from 'lodash';

import { KEEP_DECKS_UNSHUFFLED } from '../../constants';
import { instantiateCard } from '../../util/common';

import DeckPicker from './DeckPicker';
import GameBrowser from './GameBrowser';
import HostGame from './HostGame';
import LobbyStatus from './LobbyStatus';
import UsernamePicker from './UsernamePicker';
import Waiting from './Waiting';

export default class Lobby extends Component {
  static propTypes = {
    socket: object,
    availableDecks: array,

    onConnect: func,
    onJoinGame: func,
    onSpectateGame: func,
    onHostGame: func,
    onSetUsername: func
  };

  constructor(props) {
    super(props);

    this.state = {
      selectedDeck: this.props.availableDecks.length - 1
    };
  }

  getDeck() {
    const deck = this.props.availableDecks[this.state.selectedDeck].cards.map(instantiateCard);
    return KEEP_DECKS_UNSHUFFLED ? deck : shuffle(deck);
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
        <UsernamePicker
          clientId={skt.clientId}
          username={skt.username}
          onSetUsername={this.props.onSetUsername} />
        {
          skt.hosting ?
            <Waiting /> :
            <div>
              <DeckPicker
                availableDecks={this.props.availableDecks}
                selectedDeckIdx={this.state.selectedDeck}
                onChooseDeck={idx => { this.setState({selectedDeck: idx}); }} />
              <GameBrowser
                openGames={skt.waitingPlayers}
                inProgressGames={skt.games}
                usernameMap={skt.clientIdToUsername}
                onJoinGame={(gameId, gameName) => { this.props.onJoinGame(gameId, gameName, this.getDeck()); }}
                onSpectateGame={(gameId, gameName) => { this.props.onSpectateGame(gameId, gameName); }} />
              <HostGame
                onHostGame={gameName => { this.props.onHostGame(gameName, this.getDeck()); }} />
            </div>
        }
      </div>
    );
  }
}
