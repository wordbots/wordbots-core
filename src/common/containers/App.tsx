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
import HelpDialog from '../components/cards/HelpDialog';
import ErrorBoundary from '../components/ErrorBoundary';
import NavMenu from '../components/NavMenu';
import LoginDialog from '../components/users/LoginDialog';
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from '../constants';
import PersonalTheme from '../themes/personal';
import * as w from '../types';
import { isFlagSet, logAnalytics } from '../util/browser';
import { listenToSets, listenToUserData, onLogin, onLogout } from '../util/firebase';

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
  inGame: boolean
  inSandbox: boolean
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
  loading: boolean
}

function mapStateToProps(state: w.State): AppStateProps {
  return {
    inGame: state.game.started,
    inSandbox: state.game.sandbox,
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
    loading: true
  };

  constructor(props: AppProps) {
    super(props);
    logAnalytics();
  }

  public componentDidMount(): void {
    listenToSets(this.props.onReceiveFirebaseData);

    onLogin((user) => {
      this.setState({loading: false});
      this.props.onLoggedIn(user);
      listenToUserData(this.props.onReceiveFirebaseData);
      listenToSets(this.props.onReceiveFirebaseData);
    });

    onLogout(() => {
      this.setState({loading: false});
      this.props.onLoggedOut();
      this.props.onReceiveFirebaseData(null);
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

  get inGame(): boolean {
    const { location, inGame, inSandbox } = this.props;
    return (inGame || isInGameUrl(location.pathname)) && !inSandbox;
  }

  get sidebar(): JSX.Element | null {
    if (this.state.loading || this.inGame) {
      return null;
    } else {
      return <NavMenu onRerender={this.props.onRerender} />;
    }
  }

  get content(): JSX.Element {
    const sidebarWidth = isFlagSet('sidebarCollapsed') ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

    // TODO Figure out how to avoid having to type the Route components as `any`
    // (see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/13689)
    return (
      <div
        style={{
          paddingLeft: this.inGame ? 0 : sidebarWidth,
          transition: 'padding-left 200ms ease-in-out'
        }}
      >
        <ErrorBoundary>
          <Switch>
            <Route exact path="/" component={Home} />
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
    if (this.state.loading) {
      return null;
    } else {
      const { history, location } = this.props;
      return (
        <div>
          <LoginDialog history={history} />
          <DictionaryDialog history={history} />
          <HelpDialog history={history} location={location} />
        </div>
      );
    }
  }

  public render(): JSX.Element {
    return (
      <div>
        <Helmet defaultTitle="Wordbots" titleTemplate="%s - Wordbots"/>
        <TitleBar />
        <div>
          {this.sidebar}
          {this.state.loading ? null : this.content}
        </div>
        {this.dialogs}
      </div>
    );
  }

  private redirectToRoot = (): JSX.Element => (
    <Redirect to="/"/>
  )
}

export default hot(module)(withRouter(connect(mapStateToProps, mapDispatchToProps)(App)));
