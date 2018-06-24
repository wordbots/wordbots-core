import * as React from 'react';
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
    selectedDeckIdx: Math.min(state.collection.selectedDeckIdx || 0, validDecks.length),
    selectedFormatIdx: state.collection.selectedFormatIdx || 0
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    onConnect: () => {
      dispatch(socketActions.connect());
    },
    onHostGame: (name, format, deck) => {
      dispatch(socketActions.host(name, format, deck));
    },
    onJoinGame: (id, name, deck) => {
      dispatch(socketActions.join(id, name, deck));
    },
    onJoinQueue: (deck) => {
      dispatch(socketActions.joinQueue(deck));
    },
    onLeaveQueue: () => {
      dispatch(socketActions.leaveQueue());
    },
    onSpectateGame: (id) => {
      dispatch(socketActions.spectate(id));
    },
    onSendChatMessage: (msg) => {
      dispatch(socketActions.chat(msg));
    },
    onSelectDeck: (deckIdx) => {
      dispatch(collectionActions.selectDeck(deckIdx));
    },
    onSelectFormat: (formatIdx) => {
      dispatch(collectionActions.selectFormat(formatIdx));
    }
  };
}

export class Play extends React.Component {
  static propTypes = {
    started: bool,
    actionLog: arrayOf(object),

    socket: object,
    cards: arrayOf(object),
    availableDecks: arrayOf(object),
    selectedDeckIdx: number,
    selectedFormatIdx: number,

    history: object,

    onConnect: func,
    onJoinQueue: func,
    onLeaveQueue: func,
    onHostGame: func,
    onJoinGame: func,
    onSpectateGame: func,
    onSendChatMessage: func,
    onSelectDeck: func,
    onSelectFormat: func
  };

  static baseUrl = '/play';

  static urlForGameMode = (mode, format = null, deck = null) => {
    const maybeFormatParam = format ? `/${format}` : '';
    const maybeDeckParam = deck ? `/${deck.id}` : '';
    return `${Play.baseUrl}/${mode}${maybeFormatParam}${maybeDeckParam}`;
  }

  static isInGameUrl = (url) =>
    (url.startsWith(Play.baseUrl) && compact(url.split('/')).length > 1);

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

  selectMode = (mode, format = null, deck = null) => {
    this.props.history.push(Play.urlForGameMode(mode, format, deck));
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
          selectedFormatIdx={this.props.selectedFormatIdx}
          onConnect={this.props.onConnect}
          onHostGame={this.props.onHostGame}
          onJoinGame={this.props.onJoinGame}
          onJoinQueue={this.props.onJoinQueue}
          onLeaveQueue={this.props.onLeaveQueue}
          onSpectateGame={this.props.onSpectateGame}
          onSelectDeck={this.props.onSelectDeck}
          onSelectFormat={this.props.onSelectFormat}
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
          <Route path={`${Play.urlForGameMode('practice')}/:format/:deck`} component={GameAreaContainer} />
          <Route path={Play.urlForGameMode('casual')} render={this.renderLobby} />
          <Route exact path={Play.baseUrl} render={this.renderLobby} />
          <Route path={Play.urlForGameMode('ranked')} render={this.renderLobby} />
          <Redirect to={Play.baseUrl} />
        </Switch>

        {this.rightMenu}
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Play));
