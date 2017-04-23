import React, { Component } from 'react';
import { bool, func, string, object } from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import cookie from 'react-cookie';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

import { inBrowser } from '../util/common';
import * as UserActions from '../actions/user';
import NavMenu from '../components/NavMenu';
import GameMenu from '../containers/GameMenu';
import Creator from '../containers/Creator';
import Collection from '../containers/Collection';
import Deck from '../containers/Deck';
import Decks from '../containers/Decks';
import Play from '../containers/Play';
import Home from '../containers/Home';
import PersonalTheme from '../themes/personal';

// Hacky analytics implementation.
let ReactGA, currentLocation;
if (inBrowser()) {
  ReactGA = require('react-ga');
  ReactGA.initialize('UA-345959-18');
}

function mapStateToProps(state) {
  return {
    version: state.version,
    user: state.user,
    layout: state.layout.present,
    inGame: state.game.started
  };
}

function mapDispatchToProps(dispatch) {
  return Object.assign(bindActionCreators(UserActions, dispatch), {
    onRouting(path) {
       // To signal to reducers that the route has changed.
      dispatch({type: 'OPEN_PAGE', value: { path }});
    },
    toggleSidebar(value) {
      dispatch({type: 'TOGGLE_SIDEBAR', value: value});
    }
  });
}

class App extends Component {
  static childContextTypes = {
    muiTheme: object
  };

  static propTypes = {
    getUserInfo: func,
    toggleClearCookie: func,
    toggleSidebar: func,
    onRouting: func,
    undo: func,
    redo: func,
    children: object,
    user: object,
    version: string,
    layout: object,
    inGame: bool
  };

  constructor(props) {
    super(props);

    this.state = {
      currentLocation: null,
      open: true
    };
  }

  componentWillReceiveProps(nextState) {
    if (nextState.user.token && !cookie.load('token')) {
      //console.log('Setting up token in cookie');
      cookie.save('token', nextState.user.token);
    }

    if (nextState.user.token && !nextState.user.info) {
      this.props.getUserInfo(nextState.user);
    }

    if (nextState.user.clearCookie && cookie.load('token')) {
      cookie.remove('token');
      this.props.toggleClearCookie();
    }
  }

  componentWillMount() {
    this.logPageView();
  }

  componentWillUpdate() {
    this.logPageView();
  }

  logPageView() {
    // Hacky analytics implementation.
    if (inBrowser() && window.location.pathname !== currentLocation) {
      currentLocation = window.location.pathname;
      this.props.onRouting(currentLocation);
      ReactGA.set({ page: currentLocation });
      ReactGA.pageview(currentLocation);
    }
  }

  handleToggle() {
    this.props.toggleSidebar(!this.state.open);
    this.setState({open: !this.state.open});
  }

  getChildContext() {
    return {
      muiTheme: getMuiTheme(PersonalTheme)
    };
  }

  render() {
    //const { user, version } = this.props;

    return (
      <div>
        <div style={{height: 66}}>
          <AppBar
            zDepth={1}
            title={
              <Link style={{
                color: '#fff', fontFamily: 'Carter One', fontSize: 32
              }} to="/">WORDBOTS</Link>
            }
            style={{
              position: 'fixed',
              top: 0
            }}
            iconElementLeft={
              <IconButton onClick={this.handleToggle.bind(this)}>
                <FontIcon className="material-icons">menu</FontIcon>
              </IconButton>}
          />
        </div>
        <div>
          {this.props.inGame ? <GameMenu open={this.state.open} /> : <NavMenu open={this.state.open} />}
          <div>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/home" component={Home} />
              <Route path="/collection" component={Collection} />
              <Route path="/creator" component={Creator} />
              <Route path="/decks" component={Decks} />
              <Route path="/deck" component={Deck} />
              <Route path="/play" component={Play} />
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
