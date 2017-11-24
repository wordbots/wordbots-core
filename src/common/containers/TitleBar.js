import React, { Component } from 'react';
import { bool, func, object } from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { NavLink } from 'react-router-dom';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
/* eslint-disable import/no-unassigned-import */
import 'whatwg-fetch';
/* eslint-enable import/no-unassigned-import */

import { isFlagSet, toggleFlag } from '../util/browser';
import { logout } from '../util/firebase';
import * as actions from '../actions/global';
import RouterDialog from '../components/RouterDialog';
import Tooltip from '../components/Tooltip';

function mapStateToProps(state) {
  return {
    user: state.global.user
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onRerenderApp(value) {
      dispatch(actions.rerender(value));
    }
  };
}

class TitleBar extends Component {
  static propTypes = {
    user: object,
    inGame: bool,

    history: object,

    onRerenderApp: func
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

  toggleSidebar = () => {
    toggleFlag('sidebarCollapsed');
    this.props.onRerenderApp();
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

  get title() {
    if (this.props.inGame) {
      return (
        <div style={{fontFamily: 'Carter One', fontSize: 32}}>
          WORDBOTS
        </div>
      );
    } else {
      return (
        <NavLink
          to="/"
          className="topLink"
          style={{fontFamily: 'Carter One', fontSize: 32}}
        >
          WORDBOTS
        </NavLink>
      );
    }
  }

  render() {
    return (
      <div style={{height: 64}}>
        <AppBar
          title={this.title}
          style={{
            position: 'fixed',
            top: 0
          }}
          iconElementLeft={
            <Tooltip
              text={isFlagSet('sidebarCollapsed') ? 'Expand Menu' : 'Collapse Menu' }
              place="right"
            >
              <IconButton onClick={this.toggleSidebar}>
                <FontIcon className="material-icons" color="white">menu</FontIcon>
              </IconButton>
            </Tooltip>
          }
          iconElementRight={this.userMenu}
          showMenuIconButton={!this.props.inGame}
        />
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TitleBar));
