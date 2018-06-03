import React, { Component } from 'react';
import { arrayOf, func, number, object, string } from 'prop-types';

import { shuffleCardsInDeck } from '../../util/cards';
import { FORMATS } from '../../store/gameFormats';

import DeckPicker from './DeckPicker';
import FormatPicker from './FormatPicker';
import GameBrowser from './GameBrowser';
import RankedQueue from './RankedQueue';
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
    selectedDeckIdx: number,
    selectedFormatIdx: number,

    onConnect: func,
    onJoinGame: func,
    onSpectateGame: func,
    onJoinQueue: func,
    onLeaveQueue: func,
    onHostGame: func,
    onSelectDeck: func,
    onSelectFormat: func,
    onSelectMode: func
  };

  get hasNoDecks() {
    return this.props.availableDecks.length === 0;
  }

  get deck() {
    const { availableDecks, cards, selectedDeckIdx } = this.props;
    const deck = availableDecks[selectedDeckIdx];
    return {
      id: deck.id,
      cards: shuffleCardsInDeck(deck, cards)
    };
  }

  get format() {
    return FORMATS[this.props.selectedFormatIdx].name;
  }

  handleSelectMode = (mode) => {
    if (mode === 'practice') {
      // If selecting practice mode, pass the deck and format into the URL.
      this.props.onSelectMode(mode, this.format, this.deck);
    } else {
      this.props.onSelectMode(mode);
    }
  };

  handleJoinQueue = () => {
    this.props.onJoinQueue(this.deck.cards);
  };

  handleLeaveQueue = () => {
    this.props.onLeaveQueue();
  };

  handleJoinGame = (gameId, gameName) => {
    this.props.onJoinGame(gameId, gameName, this.deck.cards);
  };

  handleHostGame = (gameName) => {
    this.props.onHostGame(gameName, this.format, this.deck.cards);
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
    } else if (gameMode === '/ranked') {
      if (socket.hosting) {
        return <Waiting />;
      } else {
        return (
          <div>
            <RankedQueue
              disabled={this.hasNoDecks}
              queuing={socket.queuing}
              queueSize={socket.queueSize}
              onJoinQueue={this.handleJoinQueue}
              onLeaveQueue={this.handleLeaveQueue}
            />
          </div>
        );
      }
    } else {
      return <ModeSelection onSelectMode={this.handleSelectMode}/>;
    }
  }

  render() {
    const {
      availableDecks, cards, gameMode, selectedDeckIdx, selectedFormatIdx, socket,
      onConnect, onSelectDeck, onSelectFormat
    } = this.props;
    const { clientIdToUsername, connected, connecting, playersOnline } = socket;

    return (
      <div style={{padding: '48px 328px 0 72px'}}>
        <LobbyStatus
          connecting={connecting}
          connected={connected}
          playersOnline={playersOnline}
          usernameMap={clientIdToUsername}
          onConnect={onConnect} />

        <div style={{display: 'flex'}}>
          <DeckPicker
            cards={cards}
            availableDecks={availableDecks}
            selectedDeckIdx={selectedDeckIdx}
            onChooseDeck={onSelectDeck} />
          <FormatPicker
            selectedFormatIdx={selectedFormatIdx}
            onChooseFormat={onSelectFormat} />
        </div>

        {this.renderLobbyContent(gameMode, socket)}
      </div>
    );
  }
}
