import React, { Component } from 'react';
import { bool, func, object, array } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router';

import Chat from '../components/multiplayer/Chat';
import Lobby from '../components/multiplayer/Lobby';
import * as socketActions from '../actions/socket';
import * as gameActions from '../actions/game';

import GameArea from './GameArea';

export function mapStateToProps(state) {
  return {
    started: state.game.started,
    actionLog: state.game.actionLog,

    socket: state.socket,
    cards: state.collection.cards,
    availableDecks: state.collection.decks.filter(d => d.cardIds.length === 30)
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    onConnect: () => {
      dispatch(socketActions.connect());
    },
    onHostGame: (name, deck) => {
      dispatch(socketActions.host(name, deck));
    },
    onJoinGame: (id, name, deck) => {
      dispatch(socketActions.join(id, name, deck));
    },
    onSpectateGame: (id) => {
      dispatch(socketActions.spectate(id));
    },
    onStartPractice: (deck) => {
      dispatch(gameActions.startPractice(deck));
    },
    onStartTutorial: () => {
      dispatch(gameActions.startTutorial());
    },
    onSendChatMessage: (msg) => {
      dispatch(socketActions.chat(msg));
    }
  };
}

export class Play extends Component {
  static propTypes = {
    started: bool,
    actionLog: array,

    socket: object,
    cards: array,
    availableDecks: array,

    history: object,

    onConnect: func,
    onHostGame: func,
    onJoinGame: func,
    onSpectateGame: func,
    onStartTutorial: func,
    onStartPractice: func,
    onSendChatMessage: func
  };

  componentDidMount() {
    if (!this.props.socket.connected) {
      this.props.onConnect();
    }
  }

  selectMode = (mode, deck) => {
    if (mode === 'tutorial') {
      this.props.onStartTutorial();
    } else if (mode === 'practice') {
      this.props.onStartPractice(deck);
    }

    this.props.history.push(`play/${mode}`);
  }

  get lobby() {
    if (this.props.started) {
      return <GameArea />;
    } else {
      return (
        <Lobby
          socket={this.props.socket}
          gameMode={this.props.history.location.pathname.split('/play')[1]}
          cards={this.props.cards}
          availableDecks={this.props.availableDecks}
          onConnect={this.props.onConnect}
          onHostGame={this.props.onHostGame}
          onJoinGame={this.props.onJoinGame}
          onSpectateGame={this.props.onSpectateGame}
          onSelectMode={this.selectMode} />
      );
    }
  }

  get rightMenu() {
    if (!this.props.started) {
      return (
        <Chat
          roomName={this.props.socket.hosting ? null : this.props.socket.gameName}
          messages={this.props.socket.chatMessages.concat(this.props.actionLog)}
          onSendMessage={this.props.onSendChatMessage} />
      );
    }
  }

  render() {
    return (
      <div>
        <Helmet title="Play"/>

        <Switch>
          <Route path="/play/tutorial" component={GameArea} />
          <Route path="/play/practice" component={GameArea} />
          <Route path="/play/casual" render={() => this.lobby} />
          <Route render={() => this.lobby} />
        </Switch>

        {this.rightMenu}
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Play));
