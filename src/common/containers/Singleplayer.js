import * as React from 'react';
import { arrayOf, bool, object } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router';
import { compact } from 'lodash';

import SingleplayerLobby from '../components/play/singleplayer/SingleplayerLobby';

import GameAreaContainer from './GameAreaContainer';

export function mapStateToProps(state) {
  return {
    started: state.game.started,

    socket: state.socket,
    cards: state.collection.cards,
    availableDecks: state.collection.decks
  };
}

export class Singleplayer extends React.Component {
  static propTypes = {
    started: bool,

    socket: object,
    cards: arrayOf(object),
    availableDecks: arrayOf(object),

    history: object
  };

  static baseUrl = '/singleplayer';

  static urlForGameMode = (mode, format = null, deck = null) => {
    const maybeFormatParam = format ? `/${format}` : '';
    const maybeDeckParam = deck ? `/${deck.id}` : '';
    return `${Singleplayer.baseUrl}/${mode}${maybeFormatParam}${maybeDeckParam}`;
  }

  static isInGameUrl = (url) =>
    (url.startsWith(Singleplayer.baseUrl) && compact(url.split('//')[0].split('/')).length > 1);

  selectMode = (mode, format = null, deck = null) => {
    this.props.history.push(Singleplayer.urlForGameMode(mode, format, deck));
  }

  renderLobby = () => {
    const { availableDecks, cards, history, started, socket } = this.props;
    if (started && Singleplayer.isInGameUrl(history.location.pathname)) {
      return <GameAreaContainer />;
    } else {
      return (
        <SingleplayerLobby
          socket={socket}
          gameMode={history.location.pathname.split('/singleplayer')[1]}
          cards={cards}
          availableDecks={availableDecks}
          history={history}
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
          <Route path={`${Singleplayer.baseUrl}//:dialog`} render={this.renderLobby} />
          <Redirect to={Singleplayer.baseUrl} />
        </Switch>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps)(Singleplayer));
