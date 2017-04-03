import React, { Component } from 'react';
import { shuffle } from 'lodash';

import { SHUFFLE_DECKS } from '../../constants';
import { instantiateCard } from '../../util/common';

import DeckPicker from './DeckPicker';
import GameBrowser from './GameBrowser';
import HostGame from './HostGame';
import LobbyStatus from './LobbyStatus';
import UsernamePicker from './UsernamePicker';
import Waiting from './Waiting';

class Lobby extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedDeck: 0
    };
  }

  getDeck() {
    const deck = this.props.availableDecks[this.state.selectedDeck].cards.map(instantiateCard);
    return SHUFFLE_DECKS ? shuffle(deck) : deck;
  }

  render() {
    const skt = this.props.socket;

    return (
      <div>
        <LobbyStatus
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
                usernameMap={skt.clientIdToUsername}
                onJoinGame={(gameId, gameName) => { this.props.onJoinGame(gameId, gameName, this.getDeck()); }} />
              <HostGame
                onHostGame={gameName => { this.props.onHostGame(gameName, this.getDeck()); }} />
            </div>
        }
      </div>
    );
  }
}

const { array, func, object } = React.PropTypes;

Lobby.propTypes = {
  socket: object,
  availableDecks: array,

  onConnect: func,
  onJoinGame: func,
  onHostGame: func,
  onSetUsername: func
};

export default Lobby;
