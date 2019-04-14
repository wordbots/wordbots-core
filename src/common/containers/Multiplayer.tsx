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
import Chat from '../components/play/multiplayer/Chat';
import MultiplayerLobby from '../components/play/multiplayer/MultiplayerLobby';
import * as w from '../types';

import GameAreaContainer from './GameAreaContainer';

interface MultiplayerStateProps {
  actionLog: w.LoggedAction[]
  availableDecks: w.DeckInStore[]
  cards: w.CardInStore[]
  sets: w.Set[]
  socket: w.SocketState
  started: boolean
  user: fb.User | null
}

interface MultiplayerDispatchProps {
  onConnect: () => void
  onHostGame: (name: string, format: w.Format, deck: w.Deck, options: w.GameOptions) => void
  onCancelHostGame: () => void
  onJoinGame: (id: m.ClientID, name: string, deck: w.Deck) => void
  onJoinQueue: (format: w.Format, deck: w.Deck) => void
  onLeaveQueue: () => void
  onSpectateGame: (id: m.ClientID, name: string) => void
  onSendChatMessage: (msg: string) => void
}

type MultiplayerProps = MultiplayerStateProps & MultiplayerDispatchProps & { history: History };

export function mapStateToProps(state: w.State): MultiplayerStateProps {
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

export function mapDispatchToProps(dispatch: Dispatch): MultiplayerDispatchProps {
  return {
    onConnect: () => {
      dispatch(socketActions.connect());
    },
    onHostGame: (name: string, format: w.Format, deck: w.Deck, options: w.GameOptions) => {
      dispatch(socketActions.host(name, format, deck, options));
    },
    onCancelHostGame: () => {
      dispatch(socketActions.cancelHost());
    },
    onJoinGame: (id: m.ClientID, name: string, deck: w.Deck) => {
      dispatch(socketActions.join(id, name, deck));
    },
    onJoinQueue: (format: w.Format, deck: w.Deck) => {
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

export class Multiplayer extends React.Component<MultiplayerProps> {
  public static baseUrl: string = '/multiplayer';

  public static urlForGameMode = (mode: string, format: w.BuiltInFormat | null = null, deck: w.DeckInStore | null = null) => {
    const maybeFormatParam = format ? `/${format}` : '';
    const maybeDeckParam = deck ? `/${deck.id}` : '';
    return `${Multiplayer.baseUrl}/${mode}${maybeFormatParam}${maybeDeckParam}`;
  }

  public static isInGameUrl = (url: string) =>
    (url.startsWith(Multiplayer.baseUrl) && compact(url.split('/')).length > 2)

  get rightMenu(): React.ReactNode {
    if (this.props.started) {
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
    if (!this.props.socket.connected) {
      this.props.onConnect();
    }
  }

  public render(): JSX.Element {
    return (
      <div>
        <Helmet title="Multiplayer"/>

        <Switch>
          <Route path={Multiplayer.urlForGameMode('tutorial')} component={GameAreaContainer} />
          <Route path={`${Multiplayer.urlForGameMode('practice')}/:format/:deck`} component={GameAreaContainer} />
          <Route exact path={Multiplayer.baseUrl} render={this.renderLobby} />
          <Route path={`${Multiplayer.baseUrl}//:dialog`} render={this.renderLobby} />
          <Redirect to={Multiplayer.baseUrl} />
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
        <MultiplayerLobby
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
        />
      );
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Multiplayer));
