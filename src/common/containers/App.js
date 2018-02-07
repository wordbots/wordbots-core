import React, { Component } from 'react';
import { bool, func, number, object } from 'prop-types';
import { connect } from 'react-redux';
import { Route, Redirect, Switch, withRouter } from 'react-router';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
/* eslint-disable import/no-unassigned-import */
import 'whatwg-fetch';
/* eslint-enable import/no-unassigned-import */

import { isFlagSet, logAnalytics } from '../util/browser';
import { listenToUserData, onLogin, onLogout } from '../util/firebase';
import * as actions from '../actions/global';
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
import Home from './Home';
import Play from './Play';
import GameArea from './GameArea';
import About from './About';

function mapStateToProps(state) {
  return {
    inGame: state.game.started,
    inTutorial: state.game.tutorial,
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

class App extends Component {
  static childContextTypes = {
    muiTheme: object
  };

  static propTypes = {
    inGame: bool,
    inTutorial: bool,
    renderId: number,  // eslint-disable-line react/no-unused-prop-types

    history: object,

    onLoggedIn: func,
    onLoggedOut: func,
    onReceiveFirebaseData: func,
    onRerender: func
  };

  state = {
    loading: true
  };

  componentWillMount() {
    logAnalytics();
  }

  componentDidMount() {
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
    logAnalytics();
  }

  getChildContext() {
    return {
      muiTheme: getMuiTheme(PersonalTheme)
    };
  }

  get isSidebarExpanded() {
    return !isFlagSet('sidebarCollapsed') || this.props.inTutorial;
  }

  get sidebar() {
    if (this.state.loading) {
      return null;
    } else if (this.props.inGame) {
      return null;
    } else {
      return <NavMenu onRerender={this.props.onRerender} />;
    }
  }

  get content() {
    const paddingLeft = this.props.inGame ? 0 : (this.isSidebarExpanded ? 224 : 64);

    if (this.state.loading) {
      return null;
    } else {
      return (
        <div style={{
          paddingLeft: paddingLeft,
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
              <Route path="/play" component={Play} />
              <Route path="/sandbox" component={GameArea} />
              <Route path="/about" component={About} />
              <Route render={this.redirectToRoot} />
            </Switch>
          </ErrorBoundary>
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
        <TitleBar inGame={this.props.inGame}/>
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
