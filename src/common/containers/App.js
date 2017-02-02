import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as LayoutActions from '../actions/layout';
import * as UserActions from '../actions/user';
import Home from '../components/Home';
import Header from '../components/layout/Header';
import cookie from 'react-cookie';
import ThemeManager from 'material-ui/lib/styles/theme-manager';
import PersonalTheme from '../themes/personal';

class App extends Component {
  constructor(props) {
    super(props);

    this.eventToggleSidebar = this.eventToggleSidebar.bind(this);
    this.eventUndo = this.eventUndo.bind(this);
    this.eventRedo = this.eventRedo.bind(this);
  }

  componentWillReceiveProps(nextState) {
    if (nextState.user.token && !cookie.load('token')) {
      console.log('Setting up token in cookie');
      cookie.save('token', nextState.user.token);
    }

    if (nextState.user.token && !nextState.user.info) {
      this.props.getUserInfo(nextState.user);
    }

    if (nextState.user.clearCookie && cookie.load('token')) {
      cookie.remove('token');
      this.props.toogleClearCookie();
    }
  }

  eventToggleSidebar(e) {
    e.preventDefault();
    this.props.toggleSidebar(!this.props.layout.sidebarOpen);
  }

  eventUndo(e) {
    e.preventDefault();
    this.props.undo();
  }

  eventRedo(e) {
    e.preventDefault();
    this.props.redo();
  }

  getChildContext() {
    return {
      muiTheme: ThemeManager.getMuiTheme(PersonalTheme)
    };
  }

  render() {
    //const { user, version } = this.props;

    return (
      <div>
        <Header/>
        <div>
          {!this.props.children && <Home />}
          {this.props.children}
        </div>
      </div>
    );
  }
}

App.childContextTypes = {
  muiTheme: React.PropTypes.object
};

App.propTypes = {
  getUserInfo: PropTypes.func,
  toogleClearCookie: PropTypes.func,
  toggleSidebar: PropTypes.func,
  undo: PropTypes.func,
  redo: PropTypes.func,
  children: PropTypes.object,
  user: PropTypes.object,
  version: PropTypes.string,
  layout: PropTypes.object
};

function mapStateToProps(state) {
  return {
    version: state.version,
    user: state.user,
    layout: state.layout.present
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, LayoutActions, UserActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
