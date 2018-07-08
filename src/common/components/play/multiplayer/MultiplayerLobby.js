import * as React from 'react';
import { arrayOf, func, number, object, string } from 'prop-types';

import { shuffleCardsInDeck } from '../../../util/cards';
import { FORMATS } from '../../../store/gameFormats';
import DeckPicker from '../DeckPicker';
import FormatPicker from '../FormatPicker';

import GameBrowser from './GameBrowser';
import RankedQueue from './RankedQueue';
import HostGame from './HostGame';
import LobbyStatus from './LobbyStatus';
import MultiplayerModeSelection from './MultiplayerModeSelection';
import Waiting from './Waiting';

export default class Lobby extends React.Component {
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

  /* The currently selected deck, in its raw form. */
  get deck() {
    const { availableDecks, selectedDeckIdx } = this.props;
    return availableDecks[selectedDeckIdx];
  }

  /* The currently selected deck, in a form ready to start a game with. */
  get deckForGame() {
    const { cards } = this.props;
    const deck = this.deck;
    return { ...deck, cards: shuffleCardsInDeck(deck, cards) };
  }

  get format() {
    return FORMATS[this.props.selectedFormatIdx].name;
  }

  handleSelectFormat = (formatIdx) => {
    this.props.onSelectFormat(formatIdx);
    this.props.onSelectDeck(0);
  }

  handleSelectMode = (mode) => {
    this.props.onSelectMode(mode);
  };

  handleJoinQueue = () => {
    this.props.onJoinQueue(this.deckForGame.cards);
  };

  handleLeaveQueue = () => {
    this.props.onLeaveQueue();
  };

  handleJoinGame = (gameId, gameName) => {
    this.props.onJoinGame(gameId, gameName, this.deckForGame.cards);
  };

  handleHostGame = (gameName) => {
    this.props.onHostGame(gameName, this.format, this.deckForGame.cards);
  };

  renderLobbyContent(gameMode, socket) {
    if (gameMode === '/casual') {
      if (socket.hosting) {
        return <Waiting />;
      } else {
        return (
          <div>
            <GameBrowser
              currentDeck={this.deck}
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
      return <MultiplayerModeSelection onSelectMode={this.handleSelectMode}/>;
    }
  }

  render() {
    const {
      availableDecks, cards, gameMode, selectedDeckIdx, selectedFormatIdx, socket,
      onConnect, onSelectDeck
    } = this.props;
    const { clientIdToUsername, connected, connecting, playersOnline } = socket;

    return (
      <div style={{padding: '20px 276px 0 20px'}}>
        <LobbyStatus
          connecting={connecting}
          connected={connected}
          playersOnline={playersOnline}
          usernameMap={clientIdToUsername}
          onConnect={onConnect} />

        <div style={{display: 'flex'}}>
          <FormatPicker
            selectedFormatIdx={selectedFormatIdx}
            onChooseFormat={this.handleSelectFormat} />
          <DeckPicker
            cards={cards}
            availableDecks={availableDecks}
            selectedDeckIdx={selectedDeckIdx}
            onChooseDeck={onSelectDeck} />
        </div>

        {this.renderLobbyContent(gameMode, socket)}
      </div>
    );
  }
}
