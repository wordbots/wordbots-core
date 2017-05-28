import React, { Component } from 'react';
import { bool, func, object } from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
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

import { logout } from '../util/firebase';
import * as actions from '../actions/global';
import RouterDialog from '../components/RouterDialog';

function mapStateToProps(state) {
  return {
    user: state.global.user,
    sidebarOpen: state.global.sidebarOpen
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onToggleSidebar(value) {
      dispatch(actions.toggleSidebar(value));
    }
  };
}

class TitleBar extends Component {
  static propTypes = {
    user: object,
    sidebarOpen: bool,

    history: object,

    onToggleSidebar: func
  };

  constructor(props) {
    super(props);

    this.state = {
      userOpen: false,
      anchorEl: null
    };
  }

  openLoginDialog = () => {
    RouterDialog.openDialog(this.props.history, 'login');
  }

  handleUserMenuOpen = (event) => {
    event.preventDefault();

    this.setState({
      userOpen: true,
      anchorEl: event.currentTarget
    });
  }

  handleRequestClose = () => {
    this.setState({userOpen: false});
  }

  get userMenu() {
    if (this.props.user) {
      return (
        <div style={{marginTop: 7}}>
          <FlatButton
            style={{color: 'white'}}
            label={this.props.user.displayName}
            labelPosition="before"
            onTouchTap={(e) => this.handleUserMenuOpen(e)}
            icon={<FontIcon className="material-icons">account_circle</FontIcon>} />
          <Popover
            open={this.state.userOpen}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'right', vertical: 'top'}}
            onRequestClose={this.handleRequestClose}>
            <Menu>
              <MenuItem
                primaryText="Logout"
                onClick={() => {
                  logout();
                  this.handleRequestClose();
                }}
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
            <Link style={{
              color: '#fff', fontFamily: 'Carter One', fontSize: 32
            }} to="/">WORDBOTS</Link>
          }
          style={{
            position: 'fixed',
            top: 0
          }}
          iconElementLeft={
            <IconButton onClick={() => { this.props.onToggleSidebar(!this.props.sidebarOpen); }}>
              <FontIcon className="material-icons">menu</FontIcon>
            </IconButton>
          }
          iconElementRight={this.userMenu}
        />
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TitleBar));
