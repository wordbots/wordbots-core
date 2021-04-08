import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';
import * as fb from 'firebase';
import { History, Location } from 'history';
import * as React from 'react';
import Helmet from 'react-helmet';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router';
import { AnyAction, Dispatch } from 'redux';
import 'whatwg-fetch';  // eslint-disable-line import/no-unassigned-import

import * as actions from '../actions/global';
import DictionaryDialog from '../components/help/DictionaryDialog';
import ErrorBoundary from '../components/ErrorBoundary';
import CreatorHelpDialog from '../components/help/CreatorHelpDialog';
import NewHereDialog from '../components/help/NewHereDialog';
import NavMenu from '../components/NavMenu';
import LoginDialog from '../components/users/LoginDialog';
import { MIN_WINDOW_WIDTH_TO_EXPAND_SIDEBAR, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from '../constants';
import muiV1Theme from '../themes/muiV1';
import * as w from '../types';
import { isFlagSet, logAnalytics } from '../util/browser';
import { getCards, getDecks, getSets, onLogin, onLogout } from '../util/firebase';

import About from './About';
import Collection from './Collection';
import Community from './Community';
import Creator from './Creator';
import Deck from './Deck';
import Decks from './Decks';
import Home from './Home';
import Play, { isInGameUrl } from './Play';
import Profile from './Profile';
import Set from './Set';
import Sets from './Sets';
import TitleBar from './TitleBar';

interface AppStateProps {
  cardIdBeingEdited: string | null
  collection: w.CollectionState
  inGame: boolean
  inSandbox: boolean
  renderId: number
  uid: w.UserId | null
}

interface AppDispatchProps {
  onLoggedIn: (user: fb.User) => void
  onLoggedOut: () => void
  onReceiveFirebaseData: (data: any) => void
  onRerender: () => void
}

type AppProps = AppStateProps & AppDispatchProps & {
  history: History
  location: Location
};

interface AppState {
  loadedCards: boolean
  loadedDecks: boolean
  loadedSets: boolean
  canSidebarExpand: boolean
}

function mapStateToProps(state: w.State): AppStateProps {
  return {
    cardIdBeingEdited: state.creator.id,
    collection: state.collection,
    inGame: state.game.started,
    inSandbox: state.game.sandbox,
    renderId: state.global.renderId,
    uid: state.global.user ? state.global.user.uid : null
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>): AppDispatchProps {
  return {
    onLoggedIn: (user: fb.User) => {
      dispatch(actions.loggedIn(user));
    },
    onLoggedOut: () => {
      dispatch(actions.loggedOut());
    },
    onReceiveFirebaseData: (data: any) => {
      dispatch(actions.firebaseData(data));
    },
    onRerender: () => {
      dispatch(actions.rerender());
    }
  };
}

class App extends React.Component<AppProps, AppState> {
  public state = {
    loadedCards: false,
    loadedDecks: false,
    loadedSets: false,
    canSidebarExpand: true
  };

  constructor(props: AppProps) {
    super(props);
    logAnalytics();
  }

  public componentDidMount(): void {
    const { onLoggedIn, onLoggedOut } = this.props;

    this.calculateDimensions();
    window.addEventListener('resize', this.calculateDimensions);

    this.loadSets();

    onLogin((user) => {
      onLoggedIn(user);
      this.loadUserCardsAndDecks(user.uid);
    });

    onLogout(() => {
      onLoggedOut();
      this.loadUserCardsAndDecks(null);
    });
  }

  public componentDidUpdate(): void {
    logAnalytics();
  }

  get isLoading(): boolean {
    const { loadedCards, loadedDecks, loadedSets } = this.state;
    return !(loadedCards && loadedDecks && loadedSets);
  }

  get isSidebarExpanded(): boolean {
    return this.state.canSidebarExpand && !isFlagSet('sidebarCollapsed') && !this.inSandbox;
  }

  get inGame(): boolean {
    const { location, inGame, inSandbox } = this.props;
    return (inGame || isInGameUrl(location.pathname)) && !inSandbox;
  }

  get inSandbox(): boolean {
    const { location, inGame, inSandbox } = this.props;
    return (inGame || isInGameUrl(location.pathname)) && inSandbox;
  }

  get sidebar(): JSX.Element | null {
    const { cardIdBeingEdited, onRerender } = this.props;
    const { canSidebarExpand } = this.state;

    if (this.isLoading || this.inGame) {
      return null;
    } else {
      return (
        <NavMenu
          canExpand={canSidebarExpand && !this.inSandbox}
          isExpanded={this.isSidebarExpanded}
          cardIdBeingEdited={cardIdBeingEdited}
          onRerender={onRerender}
        />
      );
    }
  }

  get content(): JSX.Element {
    const sidebarWidth = this.isSidebarExpanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

    // TODO Figure out how to avoid having to type the Route components as `any`
    // (see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/13689)
    return (
      <div style={{paddingLeft: this.inGame ? 0 : sidebarWidth}}>
        <ErrorBoundary>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="//:dialog" component={Home} />
            <Route path="/home" component={Home} />
            <Route path="/collection" component={Collection} />
            <Route path="/card/:cardId" component={Creator} />
            <Route path="/decks" component={Decks as any} />
            <Route path="/deck" component={Deck as any} />
            <Route path="/sets/:setId" component={Set as any} />
            <Route path="/sets" component={Sets as any} />
            <Route path="/play" component={Play} />
            <Route path="/community" component={Community} />
            <Route path="/about" component={About} />
            <Route path="/profile/:userId" component={Profile} />
            <Route render={this.redirectToRoot} />
          </Switch>
        </ErrorBoundary>
      </div>
    );
  }

  get dialogs(): JSX.Element | null {
    if (this.isLoading) {
      return null;
    } else {
      const { collection, uid, history, location } = this.props;
      return (
        <div>
          <LoginDialog history={history} />
          <DictionaryDialog history={history} />
          <CreatorHelpDialog history={history} location={location} />
          <NewHereDialog collection={collection} history={history} uid={uid} />
        </div>
      );
    }
  }

  get loadingMessage(): JSX.Element {
    return (
      <div
        style={{
          margin: '260px auto',
          textAlign: 'center',
          fontFamily: 'Carter One',
          fontSize: '2em',
          color: '#999'
        }}
      >
        Connecting to server ...
      </div>
    );
  }

  public render(): JSX.Element {
    return (
      <MuiThemeProvider theme={createMuiTheme(muiV1Theme)}>
        <div>
          <Helmet defaultTitle="Wordbots" titleTemplate="%s - Wordbots"/>
          <TitleBar isAppLoading={this.isLoading} />
          <div>
            {this.sidebar}
            {this.isLoading ? this.loadingMessage : this.content}
          </div>
          {this.dialogs}
        </div>
      </MuiThemeProvider>
    );
  }

  private redirectToRoot = (): JSX.Element => (
    <Redirect to="/"/>
  )

  private calculateDimensions = (): void => {
    this.setState({
      canSidebarExpand: window.innerWidth >= MIN_WINDOW_WIDTH_TO_EXPAND_SIDEBAR
    });
  }

  private loadUserCardsAndDecks = async (uid: w.UserId | null): Promise<void> => {
    const { onReceiveFirebaseData } = this.props;

    if (uid) {
      const [cards, decks] = await Promise.all([getCards(uid), getDecks(uid)]);
      onReceiveFirebaseData({ cards, decks });
    } else {
      onReceiveFirebaseData(null);
    }

    this.setState({ loadedCards: true, loadedDecks: true });
  }

  private loadSets = async (): Promise<void> => {
    const { onReceiveFirebaseData } = this.props;

    const sets = await getSets();
    onReceiveFirebaseData({ sets });
    this.setState({ loadedSets: true });
  }
}

export default hot(module)(withRouter(connect(mapStateToProps, mapDispatchToProps)(App)));
