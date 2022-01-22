import { MuiThemeProvider } from '@material-ui/core';
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
import { SIDEBAR_COLLAPSED_WIDTH, UNSUPPORTED_BROWSER_MESSAGE_HEIGHT } from '../constants';
import theme from '../themes/theme';
import * as w from '../types';
import { isSupportedBrowser, logAnalytics, toggleFlag } from '../util/browser';
import { getCards, getDecks, getSets, onLogin, onLogout } from '../util/firebase';

import About from './About';
import Collection from './Collection';
import Community from './Community';
import Creator from './Creator';
import Deck from './Deck';
import Decks from './Decks';
import Help from './Help';
import Home from './Home';
import Play, { isInGameUrl } from './Play';
import Profile from './Profile';
import Set from './Set';
import Sets from './Sets';
import TitleBar from './TitleBar';
import Loading from './Loading';

interface AppStateProps {
  cardIdBeingEdited: string | null
  collection: w.CollectionState
  inGame: boolean
  inSandbox: boolean
  uid: w.UserId | null
}

interface AppDispatchProps {
  onLoggedIn: (user: fb.User) => void
  onLoggedOut: () => void
  onReceiveFirebaseData: (data: any) => void
}

type AppProps = AppStateProps & AppDispatchProps & {
  history: History
  location: Location
};

interface AppState {
  isUnsupportedBrowser: boolean
  loadedCards: boolean
  loadedDecks: boolean
  loadedSets: boolean
}

function mapStateToProps(state: w.State): AppStateProps {
  return {
    cardIdBeingEdited: state.creator.id,
    collection: state.collection,
    inGame: state.game.started,
    inSandbox: state.game.sandbox,
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
    }
  };
}

class App extends React.Component<AppProps, AppState> {
  public state = {
    isUnsupportedBrowser: !isSupportedBrowser(),
    loadedCards: false,
    loadedDecks: false,
    loadedSets: false
  };

  constructor(props: AppProps) {
    super(props);
    logAnalytics();
  }

  public componentDidMount(): void {
    const { onLoggedIn, onLoggedOut } = this.props;

    this.loadSets();

    onLogin((user) => {
      onLoggedIn(user);
      this.loadUserCardsAndDecks(user.uid);
    });

    onLogout(() => {
      onLoggedOut();
      this.loadUserCardsAndDecks(null);
      this.loadSets();
    });
  }

  public componentDidUpdate(): void {
    logAnalytics();
  }

  get isLoading(): boolean {
    const { loadedCards, loadedDecks, loadedSets } = this.state;
    return !(loadedCards && loadedDecks && loadedSets);
  }

  get inGame(): boolean {
    const { location, inGame } = this.props;
    return (inGame || isInGameUrl(location.pathname));
  }

  get inSandbox(): boolean {
    return this.inGame && this.props.inSandbox;
  }

  get sidebar(): JSX.Element | null {
    const { cardIdBeingEdited } = this.props;
    const { isUnsupportedBrowser } = this.state;

    if (this.isLoading || (this.inGame && !this.inSandbox)) {
      return null;
    } else {
      return <NavMenu cardIdBeingEdited={cardIdBeingEdited} isUnsupportedBrowser={isUnsupportedBrowser} />;
    }
  }

  get content(): JSX.Element {
    // TODO Figure out how to avoid having to type the Route components as `any`
    // (see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/13689)
    console.log(this.inGame);
    return (
      <div style={{ paddingLeft: this.inGame ? 0 : SIDEBAR_COLLAPSED_WIDTH }}>
        <ErrorBoundary>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="//:dialog" component={Home} />
            <Route path="/home" component={Home} />
            <Route path="/collection" component={Collection} />
            <Route path="/card/:cardId" component={Creator} />
            <Route path="/decks" component={Decks as any} />
            <Route path="/deck/:deckId" component={Deck as any} />
            <Route path="/sets/:setId" component={Set as any} />
            <Route path="/sets" component={Sets as any} />
            <Route path="/play" component={Play} />
            <Route path="/community" component={Community} />
            <Route path="/about" component={About} />
            <Route path="/help" component={Help} />
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

  public render(): JSX.Element {
    const { isUnsupportedBrowser } = this.state;
    return (
      <MuiThemeProvider theme={theme}>
        <div>
          <Helmet defaultTitle="Wordbots" titleTemplate="%s - Wordbots"/>
          <TitleBar
            isAppLoading={this.isLoading}
            isUnsupportedBrowser={isUnsupportedBrowser}
            onHideUnsupportedBrowserMessage={this.handleHideUnsupportedBrowserMessage}
          />
          <div style={isUnsupportedBrowser ? { position: 'relative', top: UNSUPPORTED_BROWSER_MESSAGE_HEIGHT } : {}}>
            {this.sidebar}
            {this.isLoading ? <Loading /> : this.content}
          </div>
          {this.dialogs}
        </div>
      </MuiThemeProvider>
    );
  }

  private redirectToRoot = (): JSX.Element => (
    <Redirect to="/"/>
  )

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

  private handleHideUnsupportedBrowserMessage = () => {
    this.setState({ isUnsupportedBrowser: false });
    toggleFlag('hideUnsupportedBrowserMessage');
  }
}

export default hot(module)(withRouter(connect(mapStateToProps, mapDispatchToProps)(App)));
