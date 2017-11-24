import React, { Component } from 'react';
import { arrayOf, func, object, string } from 'prop-types';
import { shuffle } from 'lodash';

import { KEEP_DECKS_UNSHUFFLED } from '../../constants';
import { instantiateCard, cardsInDeck } from '../../util/cards';

import DeckPicker from './DeckPicker';
import GameBrowser from './GameBrowser';
import HostGame from './HostGame';
import LobbyStatus from './LobbyStatus';
import ModeSelection from './ModeSelection';
import Waiting from './Waiting';

export default class Lobby extends Component {
  static propTypes = {
    socket: object,
    gameMode: string,
    availableDecks: arrayOf(object),
    cards: arrayOf(object),

    onConnect: func,
    onJoinGame: func,
    onSpectateGame: func,
    onHostGame: func,
    onSelectMode: func
  };

  state = {
    selectedDeck: 0
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.availableDecks.length !== this.props.availableDecks.length) {
      this.setState({selectedDeck: nextProps.availableDecks.length - 1});
    }
  }

  get hasNoDecks() {
    return this.props.availableDecks.length === 0;
  }

  get deck() {
    const deck = this.props.availableDecks[this.state.selectedDeck];
    const cards = cardsInDeck(deck, this.props.cards).map(instantiateCard);
    return KEEP_DECKS_UNSHUFFLED ? cards : shuffle(cards);
  }

  handleChooseDeck = (idx) => {
    this.setState({selectedDeck: idx});
  };

  handleSelectMode = (mode) => {
    this.props.onSelectMode(mode, this.deck);
  };

  handleJoinGame = (gameId, gameName) => {
    this.props.onJoinGame(gameId, gameName, this.deck);
  };

  handleHostGame = (gameName) => {
    this.props.onHostGame(gameName, this.deck);
  };

  renderLobbyContent(gameMode, socket) {
    if (gameMode === '/casual') {
      if (socket.hosting) {
        return <Waiting />;
      } else {
        return (
          <div>
            <GameBrowser
              cannotJoinGame={this.hasNoDecks}
              openGames={socket.waitingPlayers}
              inProgressGames={socket.games}
              usernameMap={socket.clientIdToUsername}
              onJoinGame={this.handleJoinGame}
              onSpectateGame={this.props.onSpectateGame} />

            <HostGame
              disabled={this.hasNoDecks}
              onHostGame={this.handleHostGame} />
          </div>
        );
      }
    } else {
      return <ModeSelection onSelectMode={this.handleSelectMode}/>;
    }
  }

  render() {
    const skt = this.props.socket;

    return (
      <div style={{padding: '48px 328px 48px 72px'}}>
        <LobbyStatus
          connecting={skt.connecting}
          connected={skt.connected}
          playersOnline={skt.playersOnline}
          usernameMap={skt.clientIdToUsername}
          onConnect={this.props.onConnect} />

        <DeckPicker
          cards={this.props.cards}
          availableDecks={this.props.availableDecks}
          selectedDeckIdx={this.state.selectedDeck}
          onChooseDeck={this.handleChooseDeck} />

        {this.renderLobbyContent(this.props.gameMode, skt)}
      </div>
    );
  }
}
