import * as React from 'react';
import { arrayOf, func, object } from 'prop-types';

import { CHAT_WIDTH } from '../../../constants';
import RouterDialog from '../../RouterDialog';
import Title from '../../Title';
import PreGameModal from '../PreGameModal';

import GameBrowser from './GameBrowser';
import GameCreationModal from './GameCreationModal';
import LobbyStatus from './LobbyStatus';
import MultiplayerModeSelection from './MultiplayerModeSelection';
import Waiting from './Waiting';

export default class MultiplayerLobby extends React.Component {
  static propTypes = {
    socket: object,
    availableDecks: arrayOf(object),
    cards: arrayOf(object),
    user: object,

    history: object,

    onConnect: func,
    onJoinGame: func,
    onSpectateGame: func,
    onJoinQueue: func,
    onLeaveQueue: func,
    onHostGame: func,
    onCancelHostGame: func
  };

  state = {
    casualGameBeingJoined: null
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

  handleClickJoinCasualGame = (id, name, format) => {
    this.setState({
      casualGameBeingJoined: { id, name, format }
    }, () => {
      this.handleSelectMode('casual');
    });
  }

  handleJoinGame = (formatName, deck) => {
    const { id, name } = this.state.casualGameBeingJoined;
    this.props.onJoinGame(id, name, deck.cards);
  };

  handleHostGame = (gameName, formatName, deck) => {
    this.props.onHostGame(gameName, formatName, deck.cards);
  };

  renderWaiting(socket) {
    if (socket.hosting) {
      return <Waiting />;
    } else if (socket.queuing) {
      return <Waiting inQueue queueSize={socket.queueSize} />;
    }
  }

  render() {
    const {
      availableDecks, cards, history, socket, user,
      onConnect, onCancelHostGame, onSpectateGame
    } = this.props;
    const { userDataByClientId, connected, connecting, playersOnline } = socket;
    const { casualGameBeingJoined } = this.state;

    return (
      <div>
        <div>
          {casualGameBeingJoined && <PreGameModal
            mode="casual"
            title={`Join Casual Game: ${casualGameBeingJoined.name}`}
            startButtonText="Join"
            format={casualGameBeingJoined.format}
            availableDecks={availableDecks}
            cards={cards}
            history={history}
            onStartGame={this.handleJoinGame} />}
          <PreGameModal
            mode="matchmaking"
            title="Join Matchmaking Queue"
            startButtonText="Join"
            availableDecks={availableDecks}
            cards={cards}
            history={history}
            onStartGame={this.handleJoinQueue} />
          <GameCreationModal
            path="host"
            title="Create Casual Game"
            availableDecks={availableDecks}
            cards={cards}
            history={history}
            onCreateGame={this.handleHostGame} />
        </div>

        <Title text="Multiplayer" />
        <div style={{padding: `20px ${CHAT_WIDTH + 20}px 0 20px`}}>
          <LobbyStatus
            connecting={connecting}
            connected={connected}
            playersOnline={playersOnline}
            userDataByClientId={userDataByClientId}
            onConnect={onConnect} />

          {this.renderWaiting(socket)}

          <MultiplayerModeSelection onSelectMode={this.handleSelectMode} />

          <GameBrowser
            openGames={socket.waitingPlayers}
            inProgressGames={socket.games}
            user={user}
            userDataByClientId={socket.userDataByClientId}
            onCancelHostGame={onCancelHostGame}
            onJoinGame={this.handleClickJoinCasualGame}
            onSpectateGame={onSpectateGame} />
        </div>
      </div>
    );
  }
}
