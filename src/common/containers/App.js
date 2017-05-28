import React, { Component } from 'react';
import { bool, func, object } from 'prop-types';
import { connect } from 'react-redux';
import { Route, Redirect, Switch, withRouter } from 'react-router';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
/* eslint-disable import/no-unassigned-import */
import 'whatwg-fetch';
/* eslint-enable import/no-unassigned-import */

import { inBrowser } from '../util/common';
import { listenToDictionaryData, listenToUserData, onLogin, onLogout } from '../util/firebase';
import * as actions from '../actions/global';
import NavMenu from '../components/NavMenu';
import DictionaryDialog from '../components/cards/DictionaryDialog';
import LoginDialog from '../components/users/LoginDialog';
import PersonalTheme from '../themes/personal';

import TitleBar from './TitleBar';
import GameMenu from './GameMenu';
import Collection from './Collection';
import Creator from './Creator';
import Deck from './Deck';
import Decks from './Decks';
import Home from './Home';
import Play from './Play';

let ReactGA, currentLocation;
if (inBrowser()) {
  ReactGA = require('react-ga');
  ReactGA.initialize('UA-345959-18');
}

function mapStateToProps(state) {
  return {
    sidebarOpen: state.global.sidebarOpen,
    inGame: state.game.started,
    dictionary: state.global.dictionary
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
      dispatch(actions.firebaseData(data || {}));
    }
  };
}

class App extends Component {
  static childContextTypes = {
    muiTheme: object
  };

  static propTypes = {
    sidebarOpen: bool,
    inGame: bool,
    dictionary: object,

    history: object,

    onLoggedIn: func,
    onLoggedOut: func,
    onReceiveFirebaseData: func,
    onToggleSidebar: func
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      currentLocation: null
    };
  }

  componentWillMount() {
    this.logAnalytics();
  }

  componentDidMount() {
    listenToDictionaryData(this.props.onReceiveFirebaseData);

    onLogin((user) => {
      this.setState({loading: false});
      this.props.onLoggedIn(user.toJSON());
      listenToUserData(this.props.onReceiveFirebaseData);
    });

    onLogout(() => {
      this.setState({loading: false});
      this.props.onLoggedOut();
      this.props.onReceiveFirebaseData(null);
    });
  }

  componentWillUpdate() {
    this.logAnalytics();
  }

  logAnalytics() {
    if (inBrowser() && window.location.pathname !== currentLocation) {
      currentLocation = window.location.pathname;
      ReactGA.set({ page: currentLocation });
      ReactGA.pageview(currentLocation);
    }
  }

  getChildContext() {
    return {
      muiTheme: getMuiTheme(PersonalTheme)
    };
  }

  get sidebar() {
    if (this.state.loading) {
      return null;
    } else if (this.props.inGame) {
      return <GameMenu open={this.props.sidebarOpen} />;
    } else {
      return <NavMenu open={this.props.sidebarOpen} />;
    }
  }

  get content() {
    if (this.state.loading) {
      return null;
    } else {
      return (
        <div style={{
          paddingLeft: this.props.sidebarOpen ? 256 : 0
        }}>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/home" component={Home} />
            <Route path="/collection" component={Collection} />
            <Route path="/creator" component={Creator} />
            <Route path="/decks" component={Decks} />
            <Route path="/deck" component={Deck} />
            <Route path="/play" component={Play} />
            <Route render={() => <Redirect to="/"/>} />
          </Switch>
        </div>
      );
    }
  }

  get dialogs() {
    if (!this.state.loading) {
      const history = this.props.history;
      return (
        <div>
          <LoginDialog history={history} />
          <DictionaryDialog history={history} dictionary={this.props.dictionary} />
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        <TitleBar />
        <div>
          {this.sidebar}
          {this.content}
        </div>
        {this.dialogs}
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
