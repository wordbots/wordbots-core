import React, { Component } from 'react';
import LeftNav from 'material-ui/lib/left-nav';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import AppBar from 'material-ui/lib/app-bar';
import MenuItem from 'material-ui/lib/menus/menu-item';
import IconButton from 'material-ui/lib/icon-button';
import FontIcon from 'material-ui/lib/font-icon';
import { bindActionCreators } from 'redux';

import * as UserActions from '../../actions/user';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {open: true};
    this.handleToggle = this.handleToggle.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  handleLogout() {
    this.props.logout(this.props.user);
  }

  handleToggle() {
    this.props.onToggleSidebar(!this.state.open);
    this.setState({open: !this.state.open});
  }

  render() {
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
              <IconButton onClick={this.handleToggle}>
                <FontIcon className="material-icons">menu</FontIcon>
              </IconButton>}
          />
        </div>
        <div style={{width: 256, height: this.state.open ? 100 : 0, float: 'left'}}>
          <LeftNav style={{paddingTop: '80px'}} open={this.state.open}>
            <Link to="/collection">
              <MenuItem primaryText="Home" leftIcon={
                <FontIcon className="material-icons">home</FontIcon>
              }/>
            </Link>
            <Link to="/collection">
              <MenuItem primaryText="Collection" leftIcon={
                <FontIcon className="material-icons">recent_actors</FontIcon>
              }/>
            </Link>
            <Link to="/game">
              <MenuItem primaryText="Game" leftIcon={
                <FontIcon className="material-icons">videogame_asset</FontIcon>
              }/>
            </Link>
          </LeftNav>
        </div>
      </div>
    );
  }
}

const { func, object } = React.PropTypes;

Header.propTypes = {
  logout: func,
  user: object,
  onToggleSidebar: func
};

function mapStateToProps(state) {
  return {
    user : state.user
  };
}

function mapDispatchToProps(dispatch) {
  return Object.assign(bindActionCreators(UserActions, dispatch), {
    onToggleSidebar(value) {
      dispatch({type: 'TOGGLE_SIDEBAR', value: value});
    }
  });
}


export default connect(mapStateToProps, mapDispatchToProps)(Header);
