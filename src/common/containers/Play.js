import React, { Component } from 'react';
import { arrayOf, bool, func, number, object } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router';
import { compact } from 'lodash';

import { DECK_SIZE } from '../constants';
import Chat from '../components/multiplayer/Chat';
import Lobby from '../components/multiplayer/Lobby';
import * as collectionActions from '../actions/collection';
import * as socketActions from '../actions/socket';

import GameAreaContainer from './GameAreaContainer';

export function mapStateToProps(state) {
  const validDecks = state.collection.decks.filter(d => d.cardIds.length === DECK_SIZE);

  return {
    started: state.game.started,
    actionLog: state.game.actionLog,

    socket: state.socket,
    cards: state.collection.cards,
    availableDecks: validDecks,
    selectedDeckIdx: Math.min(state.collection.selectedDeckIdx || 0, validDecks.length)
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
    onSendChatMessage: (msg) => {
      dispatch(socketActions.chat(msg));
    },
    onSelectDeck: (deckIdx) => {
      dispatch(collectionActions.selectDeck(deckIdx));
    }
  };
}

export class Play extends Component {
  static propTypes = {
    started: bool,
    actionLog: arrayOf(object),

    socket: object,
    cards: arrayOf(object),
    availableDecks: arrayOf(object),
    selectedDeckIdx: number,

    history: object,

    onConnect: func,
    onHostGame: func,
    onJoinGame: func,
    onSpectateGame: func,
    onSendChatMessage: func,
    onSelectDeck: func
  };

  static baseUrl = '/play';

  static urlForGameMode = (mode, deck = null) =>
    deck ? `${Play.baseUrl}/${mode}/${deck.id}` : `${Play.baseUrl}/${mode}`;

  static isInGameUrl = (url) =>
    (url.startsWith(Play.baseUrl) && compact(url.split('/')).length > 1) ||
      url.startsWith('/sandbox');

  componentDidMount() {
    if (!this.props.socket.connected) {
      this.props.onConnect();
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

  selectMode = (mode, deck) => {
    this.props.history.push(Play.urlForGameMode(mode, deck));
  }

  renderLobby = () => {
    if (this.props.started) {
      return <GameAreaContainer />;
    } else {
      return (
        <Lobby
          socket={this.props.socket}
          gameMode={this.props.history.location.pathname.split('/play')[1]}
          cards={this.props.cards}
          availableDecks={this.props.availableDecks}
          selectedDeckIdx={this.props.selectedDeckIdx}
          onConnect={this.props.onConnect}
          onHostGame={this.props.onHostGame}
          onJoinGame={this.props.onJoinGame}
          onSpectateGame={this.props.onSpectateGame}
          onSelectDeck={this.props.onSelectDeck}
          onSelectMode={this.selectMode} />
      );
    }
  }

  render() {
    return (
      <div>
        <Helmet title="Play"/>

        <Switch>
          <Route path={Play.urlForGameMode('tutorial')} component={GameAreaContainer} />
          <Route path={`${Play.urlForGameMode('practice')}/:deck`} component={GameAreaContainer} />
          <Route path={Play.urlForGameMode('casual')} render={this.renderLobby} />
          <Route exact path={Play.baseUrl} render={this.renderLobby} />
          <Redirect to={Play.baseUrl} />
        </Switch>

        {this.rightMenu}
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Play));
