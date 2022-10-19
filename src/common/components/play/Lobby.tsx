import * as fb from 'firebase';
import { History } from 'history';
import * as React from 'react';

import * as m from '../../../server/multiplayer/multiplayer';
import { CHAT_WIDTH } from '../../constants';
import * as w from '../../types';
import { unpackDeck } from '../../util/decks';
import { GameFormat, renderFormatDisplayName } from '../../util/formats';
import Background from '../Background';
import RouterDialog from '../RouterDialog';
import Title from '../Title';

import GameBrowser from './GameBrowser';
import GameCreationModal from './GameCreationModal';
import LobbyStatus from './LobbyStatus';
import MultiplayerModeSelection from './MultiplayerModeSelection';
import PreGameModal from './PreGameModal';
import SingleplayerDialog from './SingleplayerDialog';
import Waiting from './Waiting';

interface LobbyProps {
  socket: w.SocketState
  availableDecks: w.DeckInStore[]
  cards: w.CardInStore[]
  sets: w.Set[]
  user: fb.User | null
  history: History

  onConnect: () => void
  onJoinGame: (id: m.ClientID, name: string, deck: w.DeckInGame) => void
  onSpectateGame: (id: m.ClientID, name: string) => void
  onJoinQueue: (format: w.Format, deck: w.DeckInGame) => void
  onLeaveQueue: () => void
  onHostGame: (name: string, format: w.Format, deck: w.DeckInGame, options: w.GameOptions) => void
  onCancelHostGame: () => void
  onNavigateToGameMode: (mode: string, format: w.BuiltInFormat | null, deck: w.DeckInStore | null) => void
}

interface LobbyState {
  casualGameBeingJoined?: {
    id: string
    name: string
    format: GameFormat
    options: w.GameOptions
  }
  queueFormat?: w.Format
}

export default class Lobby extends React.Component<LobbyProps, LobbyState> {
  public state: LobbyState = {};

  get isWaiting(): boolean {
    const { hosting, queuing } = this.props.socket;
    return hosting || queuing;
  }

  // All of the player's decks, in unpacked form.
  get decks(): w.DeckInGame[] {
    const { availableDecks, cards, sets } = this.props;
    return availableDecks.map((deck) => unpackDeck(deck, cards, sets));
  }

  public render(): JSX.Element {
    const {
      availableDecks, cards, sets, history, socket, user,
      onConnect, onCancelHostGame, onNavigateToGameMode, onSpectateGame
    } = this.props;
    const {
      clientId, connected, connecting, games,
      hosting, queuing, queueSize,
      playersOnline, playersInLobby, userDataByClientId, waitingPlayers
    } = socket;
    const { casualGameBeingJoined, queueFormat } = this.state;

    return (
      <div>
        <Background asset="compressed/IMG_2997.jpg" opacity={0.25} style={{ width: 'calc(100% - 256px)' }} />

        <div>
          {casualGameBeingJoined && <PreGameModal
            mode="casual"
            title={`Join Game: ${casualGameBeingJoined.name}`}
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
            title="Host a Multiplayer Game"
            availableDecks={availableDecks}
            cards={cards}
            sets={sets}
            history={history}
            onCreateGame={this.handleHostGame}
          />
          <SingleplayerDialog
            availableDecks={availableDecks}
            cards={cards}
            history={history}
            onSelectMode={onNavigateToGameMode}
          />
        </div>

        <Title text="Arena" />
        <div style={{ padding: `20px ${CHAT_WIDTH + 20}px 0 20px` }}>
          <LobbyStatus
            connecting={connecting}
            connected={connected}
            myClientId={clientId!}
            playersInLobby={playersInLobby}
            playersOnline={playersOnline}
            userDataByClientId={userDataByClientId}
            onConnect={onConnect}
          />

          {(hosting || queuing) &&
            <Waiting
              inQueue={queuing}
              queueFormatName={queueFormat ? renderFormatDisplayName(queueFormat) : ''}
              queueSize={queueSize}
              onLeaveQueue={this.handleLeaveQueue}
            />
          }

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
            // eslint-disable-next-line react/jsx-no-bind
            onHostGame={() => this.handleSelectMode('host')}
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

  private handleJoinQueue = (format: w.Format, deck: w.DeckInGame) => {
    this.setState({ queueFormat: format }, () => {
      this.props.onJoinQueue(format, deck);
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

  private handleJoinGame = (_formatName: w.Format, deck: w.DeckInGame) => {
    const { casualGameBeingJoined } = this.state;
    if (casualGameBeingJoined) {
      const { id, name } = casualGameBeingJoined;
      this.props.onJoinGame(id, name, deck);
    }
  }

  private handleHostGame = (gameName: string, format: w.Format, deck: w.DeckInGame, options: w.GameOptions) => {
    this.props.onHostGame(gameName, format, deck, options);
  }
}
