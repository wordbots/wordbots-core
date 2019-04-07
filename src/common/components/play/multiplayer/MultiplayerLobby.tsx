import * as fb from 'firebase';
import { History } from 'history';
import * as React from 'react';

import * as m from '../../../../server/multiplayer/multiplayer';
import { CHAT_WIDTH } from '../../../constants';
import * as w from '../../../types';
import { unpackDeck } from '../../../util/cards';
import { GameFormat } from '../../../util/formats';
import RouterDialog from '../../RouterDialog';
import Title from '../../Title';
import PreGameModal from '../PreGameModal';

import GameBrowser from './GameBrowser';
import GameCreationModal from './GameCreationModal';
import LobbyStatus from './LobbyStatus';
import MultiplayerModeSelection from './MultiplayerModeSelection';
import Waiting from './Waiting';

interface MultiplayerLobbyProps {
  socket: w.SocketState
  availableDecks: w.DeckInStore[]
  cards: w.CardInStore[]
  sets: w.Set[]
  user: fb.User | null
  history: History

  onConnect: () => void
  onJoinGame: (id: m.ClientID, name: string, deck: w.Deck) => void
  onSpectateGame: (id: m.ClientID, name: string) => void
  onJoinQueue: (format: w.Format, deck: w.Deck) => void
  onLeaveQueue: () => void
  onHostGame: (name: string, format: w.Format, deck: w.Deck, options: w.GameOptions) => void
  onCancelHostGame: () => void
}

interface MultiplayerLobbyState {
  casualGameBeingJoined?: {
    id: string
    name: string
    format: GameFormat
    options: w.GameOptions
  }
  queueFormatName: string | null
}

export default class MultiplayerLobby extends React.Component<MultiplayerLobbyProps, MultiplayerLobbyState> {
  public state: MultiplayerLobbyState = {
    queueFormatName: null
  };

  get isWaiting(): boolean {
    const { hosting, queuing } = this.props.socket;
    return hosting || queuing;
  }

  /** All of the player's decks, in unpacked form. */
  get decks(): w.Deck[] {
    const { availableDecks, cards, sets } = this.props;
    return availableDecks.map((deck) => unpackDeck(deck, cards, sets));
  }

  public render(): JSX.Element {
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
            onStartGame={this.handleJoinGame}
          />}
          <PreGameModal
            mode="matchmaking"
            title="Join Matchmaking Queue"
            startButtonText="Join"
            availableDecks={availableDecks}
            cards={cards}
            sets={sets}
            history={history}
            onStartGame={this.handleJoinQueue}
          />
          <GameCreationModal
            path="host"
            title="Create Casual Game"
            availableDecks={availableDecks}
            cards={cards}
            sets={sets}
            history={history}
            onCreateGame={this.handleHostGame}
          />
        </div>

        <Title text="Multiplayer" />
        <div style={{padding: `20px ${CHAT_WIDTH + 20}px 0 20px`}}>
          <LobbyStatus
            connecting={connecting}
            connected={connected}
            myClientId={clientId!}
            playersOnline={playersOnline}
            userDataByClientId={userDataByClientId}
            onConnect={onConnect}
          />

          {this.renderWaiting()}

          <MultiplayerModeSelection
            disabled={this.isWaiting}
            isGuest={!user}
            onSelectMode={this.handleSelectMode}
          />

          <GameBrowser
            openGames={waitingPlayers}
            inProgressGames={games}
            user={user}
            clientId={clientId}
            userDataByClientId={userDataByClientId}
            availableDecks={this.decks}
            onCancelHostGame={onCancelHostGame}
            onJoinGame={this.handleClickJoinCasualGame}
            onSpectateGame={onSpectateGame}
          />
        </div>
      </div>
    );
  }

  private handleSelectMode = (mode: string) => {
    RouterDialog.openDialog(this.props.history, mode);
  }

  private handleJoinQueue = (encodedFormat: w.Format, deck: w.Deck) => {
    const formatName: string = GameFormat.decode(encodedFormat).name!;
    this.setState({ queueFormatName: formatName }, () => {
      this.props.onJoinQueue(encodedFormat, deck);
    });
  }

  private handleLeaveQueue = () => {
    this.props.onLeaveQueue();
  }

  private handleClickJoinCasualGame = (id: string, name: string, format: GameFormat, options: w.GameOptions) => {
    this.setState({
      casualGameBeingJoined: { id, name, format, options }
    }, () => {
      this.handleSelectMode('casual');
    });
  }

  private handleJoinGame = (_formatName: w.Format, deck: w.Deck) => {
    const { casualGameBeingJoined } = this.state;
    if (casualGameBeingJoined) {
      const { id, name } = casualGameBeingJoined;
      this.props.onJoinGame(id, name, deck);
    }
  }

  private handleHostGame = (gameName: string, format: w.Format, deck: w.Deck, options: w.GameOptions) => {
    this.props.onHostGame(gameName, format, deck, options);
  }

  private renderWaiting(): JSX.Element | undefined {
    const { hosting, queuing, queueSize } = this.props.socket;
    if (hosting || queuing) {
      return (
        <Waiting
          inQueue={queuing}
          queueFormat={this.state.queueFormatName!}
          queueSize={queueSize}
          onLeaveQueue={this.handleLeaveQueue}
        />
      );
    }
  }
}
