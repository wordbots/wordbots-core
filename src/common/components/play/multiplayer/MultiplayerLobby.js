import * as React from 'react';
import { arrayOf, func, object, string } from 'prop-types';

import { CHAT_WIDTH } from '../../../constants';
import RouterDialog from '../../RouterDialog';
import Title from '../../Title';
import PreGameModal from '../PreGameModal';

import GameBrowser from './GameBrowser';
import HostGame from './HostGame';
import LobbyStatus from './LobbyStatus';
import MultiplayerModeSelection from './MultiplayerModeSelection';
import Waiting from './Waiting';

export default class Lobby extends React.Component {
  static propTypes = {
    socket: object,
    availableDecks: arrayOf(object),
    cards: arrayOf(object),

    history: object,

    onConnect: func,
    onJoinGame: func,
    onSpectateGame: func,
    onJoinQueue: func,
    onLeaveQueue: func,
    onHostGame: func,
    onSelectMode: func
  };

  state = {
    casualGameIdBeingJoined: null
  };

  handleSelectMode = (mode) => {
    RouterDialog.openDialog(this.props.history, mode);
  };

  handleJoinQueue = (formatName, deck) => {
    this.props.onJoinQueue(formatName, deck.cards);
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

  renderWaiting(socket) {
    if (socket.hosting) {
      return <Waiting />;
    } else if (socket.queuing) {
      return <Waiting inQueue queueSize={socket.queueSize} />;
    }
  }

  render() {
    const { availableDecks, cards, history, socket, onConnect } = this.props;
    const { clientIdToUsername, connected, connecting, playersOnline } = socket;

    return (
      <div>
        <div>
          <PreGameModal
            mode="ranked"
            title="Join Ranked Queue"
            startButtonText="Join"
            availableDecks={availableDecks}
            cards={cards}
            history={history}
            onStartGame={this.handleJoinQueue} />
        </div>

        <Title text="Multiplayer" />
        <div style={{padding: `20px ${CHAT_WIDTH + 20}px 0 20px`}}>
          <LobbyStatus
            connecting={connecting}
            connected={connected}
            playersOnline={playersOnline}
            usernameMap={clientIdToUsername}
            onConnect={onConnect} />

          {this.renderWaiting(socket)}

          <MultiplayerModeSelection onSelectMode={this.handleSelectMode}/>

          <HostGame
            disabled={this.hasNoDecks}
            onHostGame={this.handleHostGame} />

          <GameBrowser
            currentDeck={this.deck}
            openGames={socket.waitingPlayers}
            inProgressGames={socket.games}
            usernameMap={socket.clientIdToUsername}
            onJoinGame={this.handleJoinGame}
            onSpectateGame={this.props.onSpectateGame} />
        </div>
      </div>
    );
  }
}
