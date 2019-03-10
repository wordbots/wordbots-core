import * as React from 'react';
import { arrayOf, func, object } from 'prop-types';

import { CHAT_WIDTH } from '../../../constants.ts';
import RouterDialog from '../../RouterDialog.tsx';
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
    sets: arrayOf(object),
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
    casualGameBeingJoined: null,
    queueFormatName: null
  };

  get isWaiting() {
    const { hosting, queuing } = this.props.socket;
    return hosting || queuing;
  }

  handleSelectMode = (mode) => {
    RouterDialog.openDialog(this.props.history, mode);
  };

  handleJoinQueue = (formatName, deck) => {
    this.setState({ queueFormatName: formatName }, () => {
      this.props.onJoinQueue(formatName, deck);
    });
  };

  handleLeaveQueue = () => {
    this.props.onLeaveQueue();
  };

  handleClickJoinCasualGame = (id, name, format, options) => {
    this.setState({
      casualGameBeingJoined: { id, name, format, options }
    }, () => {
      this.handleSelectMode('casual');
    });
  }

  handleJoinGame = (formatName, deck) => {
    const { id, name } = this.state.casualGameBeingJoined;
    this.props.onJoinGame(id, name, deck);
  };

  handleHostGame = (gameName, formatName, deck, options) => {
    this.props.onHostGame(gameName, formatName, deck, options);
  };

  renderWaiting() {
    const { hosting, queuing, queueSize } = this.props.socket;
    if (hosting || queuing) {
      return (
        <Waiting
          inQueue={queuing}
          queueFormat={this.state.queueFormatName}
          queueSize={queueSize}
          onLeaveQueue={this.handleLeaveQueue} />
      );
    }
  }

  render() {
    const {
      availableDecks, cards, sets, history, socket, user,
      onConnect, onCancelHostGame, onSpectateGame
    } = this.props;
    const {
      clientId, connected, connecting, games,
      playersOnline, userDataByClientId, waitingPlayers
    } = socket;
    const { casualGameBeingJoined } = this.state;

    return (
      <div>
        <div>
          {casualGameBeingJoined && <PreGameModal
            mode="casual"
            title={`Join Casual Game: ${casualGameBeingJoined.name}`}
            startButtonText="Join"
            format={casualGameBeingJoined.format}
            options={casualGameBeingJoined.options}
            availableDecks={availableDecks}
            cards={cards}
            sets={sets}
            history={history}
            onStartGame={this.handleJoinGame} />}
          <PreGameModal
            mode="matchmaking"
            title="Join Matchmaking Queue"
            startButtonText="Join"
            availableDecks={availableDecks}
            cards={cards}
            sets={sets}
            history={history}
            onStartGame={this.handleJoinQueue} />
          <GameCreationModal
            path="host"
            title="Create Casual Game"
            availableDecks={availableDecks}
            cards={cards}
            sets={sets}
            history={history}
            onCreateGame={this.handleHostGame} />
        </div>

        <Title text="Multiplayer" />
        <div style={{padding: `20px ${CHAT_WIDTH + 20}px 0 20px`}}>
          <LobbyStatus
            connecting={connecting}
            connected={connected}
            myClientId={clientId}
            playersOnline={playersOnline}
            userDataByClientId={userDataByClientId}
            onConnect={onConnect} />

          {this.renderWaiting()}

          <MultiplayerModeSelection
            disabled={this.isWaiting}
            isGuest={!user}
            onSelectMode={this.handleSelectMode} />

          <GameBrowser
            openGames={waitingPlayers}
            inProgressGames={games}
            user={user}
            clientId={clientId}
            userDataByClientId={userDataByClientId}
            onCancelHostGame={onCancelHostGame}
            onJoinGame={this.handleClickJoinCasualGame}
            onSpectateGame={onSpectateGame} />
        </div>
      </div>
    );
  }
}
