import * as React from 'react';
import { arrayOf, bool, func, number, object } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router';
import { compact } from 'lodash';

import { FORMATS } from '../store/gameFormats';
import SingleplayerLobby from '../components/multiplayer/SingleplayerLobby';
import * as collectionActions from '../actions/collection';

import GameAreaContainer from './GameAreaContainer';

export function mapStateToProps(state) {
  const selectedFormatIdx = state.collection.selectedFormatIdx || 0;
  const selectedFormat = FORMATS[selectedFormatIdx];
  const availableDecks = state.collection.decks.filter(selectedFormat.isDeckValid);

  return {
    started: state.game.started,

    socket: state.socket,
    cards: state.collection.cards,
    availableDecks,
    selectedDeckIdx: Math.min(state.collection.selectedDeckIdx || 0, availableDecks.length),
    selectedFormatIdx
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    onSelectDeck: (deckIdx) => {
      dispatch(collectionActions.selectDeck(deckIdx));
    },
    onSelectFormat: (formatIdx) => {
      dispatch(collectionActions.selectFormat(formatIdx));
    }
  };
}

export class Singleplayer extends React.Component {
  static propTypes = {
    started: bool,

    socket: object,
    cards: arrayOf(object),
    availableDecks: arrayOf(object),
    selectedDeckIdx: number,
    selectedFormatIdx: number,

    history: object,

    onSelectDeck: func,
    onSelectFormat: func
  };

  static baseUrl = '/singleplayer';

  static urlForGameMode = (mode, format = null, deck = null) => {
    const maybeFormatParam = format ? `/${format}` : '';
    const maybeDeckParam = deck ? `/${deck.id}` : '';
    return `${Singleplayer.baseUrl}/${mode}${maybeFormatParam}${maybeDeckParam}`;
  }

  static isInGameUrl = (url) =>
    (url.startsWith(Singleplayer.baseUrl) && compact(url.split('/')).length > 1);

  selectMode = (mode, format = null, deck = null) => {
    this.props.history.push(Singleplayer.urlForGameMode(mode, format, deck));
  }

  renderLobby = () => {
    if (this.props.started) {
      return <GameAreaContainer />;
    } else {
      return (
        <SingleplayerLobby
          socket={this.props.socket}
          gameMode={this.props.history.location.pathname.split('/singleplayer')[1]}
          cards={this.props.cards}
          availableDecks={this.props.availableDecks}
          selectedDeckIdx={this.props.selectedDeckIdx}
          selectedFormatIdx={this.props.selectedFormatIdx}
          onSelectDeck={this.props.onSelectDeck}
          onSelectFormat={this.props.onSelectFormat}
          onSelectMode={this.selectMode} />
      );
    }
  }

  render() {
    return (
      <div>
        <Helmet title="Singleplayer"/>

        <Switch>
          <Route path={Singleplayer.urlForGameMode('tutorial')} component={GameAreaContainer} />
          <Route path={`${Singleplayer.urlForGameMode('practice')}/:format/:deck`} component={GameAreaContainer} />
          <Route path={Singleplayer.urlForGameMode('sandbox')} render={GameAreaContainer} />
          <Route exact path={Singleplayer.baseUrl} render={this.renderLobby} />
          <Redirect to={Singleplayer.baseUrl} />
        </Switch>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Singleplayer));
