import * as React from 'react';
import Helmet from 'react-helmet';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router';
import { History } from 'history';
import { compact } from 'lodash';

import * as w from '../types';
import SingleplayerLobby from '../components/play/singleplayer/SingleplayerLobby';

import GameAreaContainer from './GameAreaContainer';

interface SingleplayerProps {
  started: boolean
  socket: w.SocketState
  cards: w.CardInStore[]
  availableDecks: w.DeckInStore[]
}

export function mapStateToProps(state: w.State): SingleplayerProps {
  return {
    started: state.game.started,

    socket: state.socket,
    cards: state.collection.cards,
    availableDecks: state.collection.decks
  };
}

export class Singleplayer extends React.Component<SingleplayerProps & { history: History }> {
  public static baseUrl = '/singleplayer';

  public static urlForGameMode = (mode: string, format: w.Format | null = null, deck: w.DeckInStore | null = null) => {
    const maybeFormatParam = format ? `/${format}` : '';
    const maybeDeckParam = deck ? `/${deck.id}` : '';
    return `${Singleplayer.baseUrl}/${mode}${maybeFormatParam}${maybeDeckParam}`;
  }

  public static isInGameUrl = (url: string) =>
    (url.startsWith(Singleplayer.baseUrl) && compact(url.split('//')[0].split('/')).length > 1)

  public render(): JSX.Element {
    return (
      <div>
        <Helmet title="Singleplayer"/>

        <Switch>
          <Route path={Singleplayer.urlForGameMode('tutorial')} component={GameAreaContainer} />
          <Route path={`${Singleplayer.urlForGameMode('practice')}/:format/:deck`} component={GameAreaContainer} />
          <Route path={Singleplayer.urlForGameMode('sandbox')} render={GameAreaContainer as any} />
          <Route exact path={Singleplayer.baseUrl} render={this.renderLobby} />
          <Route path={`${Singleplayer.baseUrl}//:dialog`} render={this.renderLobby} />
          <Redirect to={Singleplayer.baseUrl} />
        </Switch>
      </div>
    );
  }

  private selectMode = (mode: string, format: w.Format | null = null, deck = null) => {
    this.props.history.push(Singleplayer.urlForGameMode(mode, format, deck));
  }

  private renderLobby = () => {
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
}

export default compose(
  withRouter,
  connect(mapStateToProps)
)(Singleplayer);
