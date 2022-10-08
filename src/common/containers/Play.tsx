import * as fb from 'firebase';
import { History } from 'history';
import { compact } from 'lodash';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router';
import { Dispatch } from 'redux';

import * as m from '../../server/multiplayer/multiplayer';
import * as socketActions from '../actions/socket';
import Chat from '../components/play/Chat';
import Lobby from '../components/play/Lobby';
import * as w from '../types';

import GameAreaContainer from './GameAreaContainer';

interface PlayStateProps {
  actionLog: w.LoggedAction[]
  availableDecks: w.DeckInStore[]
  cards: w.CardInStore[]
  sets: w.Set[]
  socket: w.SocketState
  started: boolean
  user: fb.User | null
}

interface PlayDispatchProps {
  onConnect: () => void
  onDisconnect: () => void
  onHostGame: (name: string, format: w.Format, deck: w.DeckInGame, options: w.GameOptions) => void
  onCancelHostGame: () => void
  onJoinGame: (id: m.ClientID, name: string, deck: w.DeckInGame) => void
  onJoinQueue: (format: w.Format, deck: w.DeckInGame) => void
  onLeaveQueue: () => void
  onSpectateGame: (id: m.ClientID, name: string) => void
  onSendChatMessage: (msg: string) => void
}

type PlayProps = PlayStateProps & PlayDispatchProps & { history: History };

export function mapStateToProps(state: w.State): PlayStateProps {
  return {
    started: state.game.started,
    actionLog: state.game.actionLog,

    socket: state.socket,
    cards: state.collection.cards,
    availableDecks: state.collection.decks,
    sets: state.collection.sets,
    user: state.global.user
  };
}

export function mapDispatchToProps(dispatch: Dispatch): PlayDispatchProps {
  return {
    onConnect: () => {
      dispatch(socketActions.connect());
    },
    onDisconnect: () => {
      dispatch(socketActions.disconnect());
    },
    onHostGame: (name: string, format: w.Format, deck: w.DeckInGame, options: w.GameOptions) => {
      dispatch(socketActions.host(name, format, deck, options));
    },
    onCancelHostGame: () => {
      dispatch(socketActions.cancelHost());
    },
    onJoinGame: (id: m.ClientID, name: string, deck: w.DeckInGame) => {
      dispatch(socketActions.join(id, name, deck));
    },
    onJoinQueue: (format: w.Format, deck: w.DeckInGame) => {
      dispatch(socketActions.joinQueue(format, deck));
    },
    onLeaveQueue: () => {
      dispatch(socketActions.leaveQueue());
    },
    onSpectateGame: (id: m.ClientID, name: string) => {
      dispatch(socketActions.spectate(id, name));
    },
    onSendChatMessage: (msg: string) => {
      dispatch(socketActions.chat(msg));
    }
  };
}

export const baseGameUrl = '/play';

export const isInGameUrl = (url: string): boolean => (
  ((url.startsWith(baseGameUrl) && compact(url.split('/')).length > 2)) || (url === '/play/sandbox')
);

export const urlForGameMode = (mode: string, format: w.BuiltInFormat | null = null, deck: w.DeckInStore | null = null): string => {
  const maybeFormatParam = format ? `/${format}` : '';
  const maybeDeckParam = deck ? `/${deck.id}` : '';
  return `${baseGameUrl}/${mode}${maybeFormatParam}${maybeDeckParam}`;
};

export class Play extends React.Component<PlayProps> {
  get rightMenu(): React.ReactNode {
    if (this.props.started || this.urlMatchesGameMode('sandbox')) {
      return null;  // If a game is in progress, it will render its own <Chat>.
    } else {
      return (
        <Chat
          roomName={this.props.socket.hosting ? null : this.props.socket.gameName}
          messages={this.props.socket.chatMessages.concat(this.props.actionLog)}
          onSendMessage={this.props.onSendChatMessage}
        />
      );
    }
  }

  public componentDidMount(): void {
    const { started, socket, onConnect } = this.props;
    if (!started && !socket.connected) {
      onConnect();
    }
  }

  public componentWillUnmount(): void {
    this.props.onDisconnect();
  }

  public render(): JSX.Element {
    return (
      <div>
        <Helmet title="Arena" />

        <Switch>
          <Route path={urlForGameMode('tutorial')} component={GameAreaContainer} />
          <Route path={`${urlForGameMode('practice')}/:format/:deck`} component={GameAreaContainer} />
          <Route path={urlForGameMode('sandbox')} component={GameAreaContainer} />
          <Route exact path={baseGameUrl} render={this.renderLobby} />
          <Route path={`${baseGameUrl}//:dialog`} render={this.renderLobby} />
          <Redirect to={baseGameUrl} />
        </Switch>

        {this.rightMenu}
      </div>
    );
  }

  private renderLobby = () => {
    if (this.props.started) {
      return <GameAreaContainer />;
    } else {
      return (
        <Lobby
          socket={this.props.socket}
          cards={this.props.cards}
          sets={this.props.sets}
          availableDecks={this.props.availableDecks}
          history={this.props.history}
          user={this.props.user}
          onConnect={this.props.onConnect}
          onHostGame={this.props.onHostGame}
          onCancelHostGame={this.props.onCancelHostGame}
          onJoinGame={this.props.onJoinGame}
          onJoinQueue={this.props.onJoinQueue}
          onLeaveQueue={this.props.onLeaveQueue}
          onSpectateGame={this.props.onSpectateGame}
          onNavigateToGameMode={this.navigateToMode}
        />
      );
    }
  }

  private navigateToMode = (mode: string, format: w.BuiltInFormat | null = null, deck: w.DeckInStore | null = null) => {
    this.props.history.push(urlForGameMode(mode, format, deck));
  }

  private urlMatchesGameMode = (mode: string) => this.props.history.location.pathname.startsWith(urlForGameMode(mode));
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Play));
