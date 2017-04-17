import React, { Component } from 'react';
import { bool, func, object, array } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

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
    availableDecks: state.collection.decks,

    sidebarOpen: state.layout.present.sidebarOpen
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
    onSetUsername: (username) => {
      dispatch(socketActions.setUsername(username));
    },
    onSendChatMessage: (msg) => {
      dispatch(socketActions.chat(msg));
    },
    onHoverCard: (index) => {
      dispatch(gameActions.setHoveredCard(index));
    },
    onHoverTile: (card) => {
      dispatch(gameActions.setHoveredTile(card));
    },
  };
}

export class Play extends Component {
  static propTypes = {
    started: bool,
    actionLog: array,

    sidebarOpen: bool,

    socket: object,
    availableDecks: array,

    onConnect: func,
    onHostGame: func,
    onJoinGame: func,
    onSpectateGame: func,
    onSetUsername: func,
    onSendChatMessage: func,
    onHoverCard: func,
    onHoverTile: func
  };

  componentDidMount() {
    if (!this.props.socket.connected) {
      this.props.onConnect();
    }
  }

  renderGameArea() {
    if (this.props.started) {
      return (
        <GameArea />
      );
    } else {
      return (
        <Lobby
          socket={this.props.socket}
          availableDecks={this.props.availableDecks}
          onConnect={this.props.onConnect}
          onHostGame={this.props.onHostGame}
          onJoinGame={this.props.onJoinGame}
          onSpectateGame={this.props.onSpectateGame}
          onSetUsername={this.props.onSetUsername} />
      );
    }
  }

  render() {
    return (
      <div style={{
        paddingLeft: this.props.sidebarOpen ? 256 : 0,
        paddingRight: 256,
        margin: '48px 72px'
      }}>
        <Helmet title="Play"/>
        {this.renderGameArea()}
        <Chat
          roomName={this.props.socket.hosting ? null : this.props.socket.gameName}
          messages={this.props.socket.chatMessages.concat(this.props.actionLog)}
          onSendMessage={this.props.onSendChatMessage}
          onHoverCard={this.props.onHoverTile} />
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Play));
