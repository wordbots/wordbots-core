import React, { Component } from 'react';
import { object } from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Route } from 'react-router';
import AppBar from 'material-ui/AppBar';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

import { logout } from '../util/firebase';
import RouterDialog from '../components/RouterDialog';

import Profile from './Profile';

function mapStateToProps(state) {
  return {
    user: state.global.user
  };
}

class TitleBar extends Component {
  static propTypes = {
    user: object,
    history: object
  };

  state = {
    userOpen: false,
    anchorEl: null
  };

  openLoginDialog = () => {
    RouterDialog.openDialog(this.props.history, 'login');
  }

  openUserMenu = (event) => {
    event.preventDefault();

    this.setState({
      userOpen: true,
      anchorEl: event.currentTarget
    });
  }

  closeUserMenu = () => {
    this.setState({userOpen: false});
  }

  handleClickLogout = () => {
    logout();
    this.closeUserMenu();
  }

  get userMenu() {
    if (this.props.user) {
      return (
        <div style={{marginTop: 7}}>
          <FlatButton
            style={{color: 'white'}}
            label={this.props.user.displayName}
            labelPosition="before"
            onTouchTap={this.openUserMenu}
            icon={<FontIcon className="material-icons">account_circle</FontIcon>} />
          <Popover
            open={this.state.userOpen}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'right', vertical: 'top'}}
            onRequestClose={this.closeUserMenu}>
            <Menu>
                <MenuItem
                    primaryText="Profile"
                    leftIcon={<FontIcon className="material-icons">account_circle</FontIcon>}>
                          <Route path="/profile" component={Profile} />
                </MenuItem>
              <MenuItem
                primaryText="Logout"
                onClick={this.handleClickLogout}
                leftIcon={<FontIcon className="material-icons">exit_to_app</FontIcon>} />
            </Menu>
          </Popover>
        </div>
      );
    } else {
      return (
        <FlatButton
          label="Login"
          labelPosition="before"
          onTouchTap={this.openLoginDialog}
          icon={<FontIcon className="material-icons">person</FontIcon>} />
      );
    }
  }

  render() {
    return (
      <div style={{height: 64}}>
        <AppBar
          title={
            <div style={{fontFamily: 'Carter One', fontSize: 32}}>
              WORDBOTS
            </div>
          }
          style={{
            position: 'fixed',
            top: 0
          }}
          iconElementLeft={<span />}
          iconElementRight={this.userMenu}
        />
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps)(TitleBar));
