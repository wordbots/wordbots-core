import * as React from 'react';
import { bool, func, number, object } from 'prop-types';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';
import { Route, Redirect, Switch, withRouter } from 'react-router';
import Helmet from 'react-helmet';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
/* eslint-disable import/no-unassigned-import */
import 'whatwg-fetch';
/* eslint-enable import/no-unassigned-import */

import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../constants.ts';
import { isFlagSet, logAnalytics } from '../util/browser.tsx';
import { listenToUserData, listenToSets, onLogin, onLogout } from '../util/firebase.ts';
import * as actions from '../actions/global.ts';
import ErrorBoundary from '../components/ErrorBoundary';
import NavMenu from '../components/NavMenu';
import DictionaryDialog from '../components/cards/DictionaryDialog';
import HelpDialog from '../components/cards/HelpDialog';
import LoginDialog from '../components/users/LoginDialog';
import PersonalTheme from '../themes/personal';

import TitleBar from './TitleBar';
import Collection from './Collection';
import Creator from './Creator';
import Deck from './Deck';
import Decks from './Decks';
import Sets from './Sets.tsx';
import NewSet from './NewSet.tsx';
import Home from './Home';
import Singleplayer from './Singleplayer';
import Multiplayer from './Multiplayer';
import About from './About';
import Profile from './Profile';

function mapStateToProps(state) {
  return {
    inGame: state.game.started,
    inSandbox: state.game.sandbox,
    renderId: state.global.renderId
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onLoggedIn(user) {
      dispatch(actions.loggedIn(user));
    },
    onLoggedOut() {
      dispatch(actions.loggedOut());
    },
    onReceiveFirebaseData(data) {
      dispatch(actions.firebaseData(data));
    },
    onRerender() {
      dispatch(actions.rerender());
    }
  };
}

class App extends React.Component {
  static childContextTypes = {
    muiTheme: object
  };

  static propTypes = {
    inGame: bool,
    inSandbox: bool,
    renderId: number,  // eslint-disable-line react/no-unused-prop-types

    history: object,
    location: object,

    onLoggedIn: func,
    onLoggedOut: func,
    onReceiveFirebaseData: func,
    onRerender: func
  };

  state = {
    loading: true
  };

  constructor() {
    super();
    logAnalytics();
  }

  componentDidMount() {
    onLogin((user) => {
      this.setState({loading: false});
      this.props.onLoggedIn(user.toJSON());
      listenToUserData(this.props.onReceiveFirebaseData);
      listenToSets(this.props.onReceiveFirebaseData);
    });

    onLogout(() => {
      this.setState({loading: false});
      this.props.onLoggedOut();
      this.props.onReceiveFirebaseData(null);
    });
  }

  componentDidUpdate() {
    logAnalytics();
  }

  getChildContext() {
    return {
      muiTheme: getMuiTheme(PersonalTheme)
    };
  }

  get inGame() {
    const { location, inGame, inSandbox } = this.props;
    return (inGame || Singleplayer.isInGameUrl(location.pathname)) && !inSandbox;
  }

  get sidebar() {
    if (this.state.loading || this.inGame) {
      return null;
    } else {
      return <NavMenu onRerender={this.props.onRerender} />;
    }
  }

  get content() {
    const sidebarWidth = isFlagSet('sidebarCollapsed') ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

    return (
      <div style={{
        paddingLeft: this.inGame ? 0 : sidebarWidth,
        transition: 'padding-left 200ms ease-in-out'
      }}>
        <ErrorBoundary>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/home" component={Home} />
            <Route path="/collection" component={Collection} />
            <Route path="/creator" component={Creator} />
            <Route path="/decks" component={Decks} />
            <Route path="/deck" component={Deck} />
            <Route path="/sets/new" component={NewSet} />
            <Route path="/sets" component={Sets} />
            <Route path="/singleplayer" component={Singleplayer} />
            <Route path="/multiplayer" component={Multiplayer} />
            <Route path="/about" component={About} />
            <Route path="/profile/:userId" component={Profile} />
            <Route render={this.redirectToRoot} />
          </Switch>
        </ErrorBoundary>
      </div>
    );
  }

  get dialogs() {
    if (this.state.loading) {
      return null;
    } else {
      const { history } = this.props;
      return (
        <div>
          <LoginDialog history={history} />
          <DictionaryDialog history={history} />
          <HelpDialog history={history} />
        </div>
      );
    }
  }

  redirectToRoot = () => (
    <Redirect to="/"/>
  );

  render() {
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
}

export default hot(module)(withRouter(connect(mapStateToProps, mapDispatchToProps)(App)));
