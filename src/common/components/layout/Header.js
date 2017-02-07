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
    this.setState({
      open: !this.state.open
    });
  }

  render() {
    return (
      <div>
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
            <IconButton>
              <FontIcon className="material-icons">menu</FontIcon>
            </IconButton>}
          onLeftIconButtonTouchTap={this.handleToggle}
        />

        <LeftNav style={{paddingTop: '80px'}} open={this.state.open}>
          <Link to="/home">
            <MenuItem primaryText="Home" leftIcon={
              <FontIcon className="material-icons">home</FontIcon>
            }/>
          </Link>
          <Link to="/cards">
            <MenuItem primaryText="Cards" leftIcon={
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
    );
  }
}

Header.propTypes = {
  logout: React.PropTypes.func,
  user: React.PropTypes.object
};

function mapStateToProps(state) {
  return {
    user : state.user
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(UserActions, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Header);
