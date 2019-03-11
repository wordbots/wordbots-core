import * as React from 'react';
import { arrayOf, bool, func, object } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router';
import { compact } from 'lodash';

import Chat from '../components/play/multiplayer/Chat';
import MultiplayerLobby from '../components/play/multiplayer/MultiplayerLobby.tsx';
import * as socketActions from '../actions/socket.ts';

import GameAreaContainer from './GameAreaContainer';

export function mapStateToProps(state) {
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

export function mapDispatchToProps(dispatch) {
  return {
    onConnect: () => {
      dispatch(socketActions.connect());
    },
    onHostGame: (name, format, deck, options) => {
      dispatch(socketActions.host(name, format, deck, options));
    },
    onCancelHostGame: () => {
      dispatch(socketActions.cancelHost());
    },
    onJoinGame: (id, name, deck) => {
      dispatch(socketActions.join(id, name, deck));
    },
    onJoinQueue: (format, deck) => {
      dispatch(socketActions.joinQueue(format, deck));
    },
    onLeaveQueue: () => {
      dispatch(socketActions.leaveQueue());
    },
    onSpectateGame: (id) => {
      dispatch(socketActions.spectate(id));
    },
    onSendChatMessage: (msg) => {
      dispatch(socketActions.chat(msg));
    }
  };
}

export class Multiplayer extends React.Component {
  static propTypes = {
    started: bool,
    actionLog: arrayOf(object),

    socket: object,
    cards: arrayOf(object),
    availableDecks: arrayOf(object),
    sets: arrayOf(object),
    user: object,

    history: object,

    onConnect: func,
    onJoinQueue: func,
    onLeaveQueue: func,
    onHostGame: func,
    onCancelHostGame: func,
    onJoinGame: func,
    onSpectateGame: func,
    onSendChatMessage: func
  };

  static baseUrl = '/multiplayer';

  static urlForGameMode = (mode, format = null, deck = null) => {
    const maybeFormatParam = format ? `/${format}` : '';
    const maybeDeckParam = deck ? `/${deck.id}` : '';
    return `${Multiplayer.baseUrl}/${mode}${maybeFormatParam}${maybeDeckParam}`;
  }

  static isInGameUrl = (url) =>
    (url.startsWith(Multiplayer.baseUrl) && compact(url.split('/')).length > 2);

  componentDidMount() {
    if (!this.props.socket.connected) {
      this.props.onConnect();
    }
  }

  get rightMenu() {
    if (this.props.started) {
      return null;  // If a game is in progress, it will render its own <Chat>.
    } else {
      return (
        <Chat
          roomName={this.props.socket.hosting ? null : this.props.socket.gameName}
          messages={this.props.socket.chatMessages.concat(this.props.actionLog)}
          onSendMessage={this.props.onSendChatMessage} />
      );
    }
  }

  renderLobby = () => {
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
          onSpectateGame={this.props.onSpectateGame} />
      );
    }
  }

  render() {
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
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Multiplayer));
