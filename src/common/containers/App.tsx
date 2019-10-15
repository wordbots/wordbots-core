import * as fb from 'firebase';
import { History, Location } from 'history';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { object } from 'prop-types';
import * as React from 'react';
import Helmet from 'react-helmet';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router';
import { AnyAction, Dispatch } from 'redux';
import 'whatwg-fetch';

import * as actions from '../actions/global';
import DictionaryDialog from '../components/cards/DictionaryDialog';
import ErrorBoundary from '../components/ErrorBoundary';
import HelpDialog from '../components/help/HelpDialog';
import NewHereDialog from '../components/help/NewHereDialog';
import NavMenu from '../components/NavMenu';
import LoginDialog from '../components/users/LoginDialog';
import { MIN_WINDOW_WIDTH_TO_EXPAND_SIDEBAR, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from '../constants';
import PersonalTheme from '../themes/personal';
import * as w from '../types';
import { isFlagSet, logAnalytics } from '../util/browser';
import { listenToCards, listenToDecks, listenToSets, onLogin, onLogout } from '../util/firebase';

import About from './About';
import Collection from './Collection';
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
  inGame: boolean
  inSandbox: boolean
  loggedIn: boolean
  renderId: number
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
    inGame: state.game.started,
    inSandbox: state.game.sandbox,
    loggedIn: state.global.user !== null,
    renderId: state.global.renderId
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
  public static childContextTypes = {
    muiTheme: object
  };

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
    const { onLoggedIn, onLoggedOut, onReceiveFirebaseData } = this.props;

    this.calculateDimensions();
    window.addEventListener('resize', this.calculateDimensions);

    listenToSets((sets) => {
      onReceiveFirebaseData({ sets });
      this.setState({ loadedSets: true });
    });

    onLogin((user) => {
      onLoggedIn(user);

      listenToCards(user.uid, (cards) => {
        onReceiveFirebaseData({ cards });
        this.setState({ loadedCards: true });
      });

      listenToDecks(user.uid, (decks) => {
        onReceiveFirebaseData({ decks });
        this.setState({ loadedDecks: true });
      });
    });

    onLogout(() => {
      this.setState({ loadedCards: true, loadedDecks: true });
      onLoggedOut();
      onReceiveFirebaseData(null);
    });
  }

  public componentDidUpdate(): void {
    logAnalytics();
  }

  public getChildContext(): any {
    return {
      muiTheme: getMuiTheme(PersonalTheme)
    };
  }

  get isLoading(): boolean {
    const { loadedCards, loadedDecks, loadedSets } = this.state;
    return !(loadedCards && loadedDecks && loadedSets);
  }

  get isSidebarExpanded(): boolean {
    const { inSandbox } = this.props;
    return this.state.canSidebarExpand && !isFlagSet('sidebarCollapsed') && !inSandbox;
  }

  get inGame(): boolean {
    const { location, inGame, inSandbox } = this.props;
    return (inGame || isInGameUrl(location.pathname)) && !inSandbox;
  }

  get sidebar(): JSX.Element | null {
    const { cardIdBeingEdited, inSandbox, onRerender } = this.props;
    const { canSidebarExpand } = this.state;

    if (this.isLoading || this.inGame) {
      return null;
    } else {
      return (
        <NavMenu
          canExpand={canSidebarExpand && !inSandbox}
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
      const { loggedIn, history, location } = this.props;
      return (
        <div>
          <LoginDialog history={history} />
          <DictionaryDialog history={history} />
          <HelpDialog history={history} location={location} />
          <NewHereDialog history={history} loggedIn={loggedIn} />
        </div>
      );
    }
  }

  get loadingMessage(): JSX.Element {
    return (
      <div
        style={{
          margin: '200px auto',
          textAlign: 'center',
          fontFamily: 'Carter One',
          fontSize: '2em',
          color: '#999',
        }}
      >
        Connecting to server ...
      </div>
    );
  }

  public render(): JSX.Element {
    return (
      <div>
        <Helmet defaultTitle="Wordbots" titleTemplate="%s - Wordbots"/>
        <TitleBar />
        <div>
          {this.sidebar}
          {this.isLoading ? this.loadingMessage : this.content}
        </div>
        {this.dialogs}
      </div>
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
}

export default hot(module)(withRouter(connect(mapStateToProps, mapDispatchToProps)(App)));
