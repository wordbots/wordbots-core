import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import cookie from 'react-cookie';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

import { inBrowser } from '../util/common';
import * as UserActions from '../actions/user';
import Creator from '../containers/Creator';
import Collection from '../containers/Collection';
import Deck from '../containers/Deck';
import Decks from '../containers/Decks';
import Game from '../containers/Game';
import Home from '../containers/Home';
import PersonalTheme from '../themes/personal';

let ReactGA, currentLocation;

if (inBrowser()) {
  ReactGA = require('react-ga');
  ReactGA.initialize('UA-345959-18');
}

function mapStateToProps(state) {
  return {
    version: state.version,
    user: state.user,
    layout: state.layout.present
  };
}

function mapDispatchToProps(dispatch) {
  return Object.assign(bindActionCreators(UserActions, dispatch), {
    toggleSidebar(value) {
      dispatch({type: 'TOGGLE_SIDEBAR', value: value});
    }
  });
}

class App extends Component {
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
    if (inBrowser() && window.location.pathname !== currentLocation) {
      currentLocation = window.location.pathname;
      console.log(currentLocation);
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

  renderLink(path, text, icon) {
    return (
      <Link to={path}>
        <MenuItem primaryText={text} leftIcon={
          <FontIcon className="material-icons">{icon}</FontIcon>
        }/>
      </Link>
    );
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
          <Drawer open={this.state.open} containerStyle={{top: 66, paddingTop: 10}}>
            {this.renderLink('/home', 'Home', 'home')}
            {this.renderLink('/collection', 'Collection', 'recent_actors')}
            {this.renderLink('/decks', 'Decks', 'view_list')}
            {this.renderLink('/game', 'Play', 'videogame_asset')}
          </Drawer>
          <div>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/home" component={Home} />
              <Route path="/game" component={Game} />
              <Route path="/creator" component={Creator} />
              <Route path="/collection" component={Collection} />
              <Route path="/deck" component={Deck} />
              <Route path="/decks" component={Decks} />
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

const { func, string, object } = React.PropTypes;

App.childContextTypes = {
  muiTheme: object
};

App.propTypes = {
  getUserInfo: func,
  toggleClearCookie: func,
  toggleSidebar: func,
  undo: func,
  redo: func,
  children: object,
  user: object,
  version: string,
  layout: object
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
