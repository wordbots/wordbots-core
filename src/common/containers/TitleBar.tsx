import * as fb from 'firebase';
import { History } from 'history';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import RouterDialog from '../components/RouterDialog';
import * as w from '../types';
import { logout } from '../util/firebase';

interface TitleBarProps {
  user: fb.User | null
}

interface TitleBarState {
  userOpen: boolean
  anchorEl: HTMLElement | undefined
}

function mapStateToProps(state: w.State): TitleBarProps {
  return {
    user: state.global.user
  };
}

class TitleBar extends React.Component<TitleBarProps & { history: History }, TitleBarState> {
  public state = {
    userOpen: false,
    anchorEl: undefined
  };

  get userMenu(): JSX.Element {
    if (this.props.user) {
      return (
        <div style={{marginTop: 7}}>
          <FlatButton
            style={{color: 'white'}}
            label={this.props.user.displayName}
            labelPosition="before"
            onClick={this.openUserMenu}
            icon={<FontIcon className="material-icons">account_circle</FontIcon>}
          />
          <Popover
            open={this.state.userOpen}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'right', vertical: 'top'}}
            onRequestClose={this.closeUserMenu}
          >
            <Menu>
              <MenuItem
                primaryText="Profile"
                onClick={this.handleClickProfile}
                leftIcon={<FontIcon className="material-icons">account_circle</FontIcon>}
              />
              <MenuItem
                primaryText="Logout"
                onClick={this.handleClickLogout}
                leftIcon={<FontIcon className="material-icons">exit_to_app</FontIcon>}
              />
            </Menu>
          </Popover>
        </div>
      );
    } else {
      return (
        <FlatButton
          label="Login / Register"
          labelPosition="before"
          onClick={this.openLoginDialog}
          icon={<FontIcon className="material-icons">person</FontIcon>}
        />
      );
    }
  }

  public render(): JSX.Element {
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

  private openLoginDialog = () => {
    RouterDialog.openDialog(this.props.history, 'login');
  }

  private openUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();

    this.setState({
      userOpen: true,
      anchorEl: event.currentTarget
    });
  }

  private closeUserMenu = () => {
    this.setState({userOpen: false});
  }

  private handleClickProfile = () => {
    const { user } = this.props;

    if (user) {
      this.props.history.push(`/profile/${user.uid}`);
    }
    this.closeUserMenu();
  }

  private handleClickLogout = () => {
    logout();
    this.closeUserMenu();
  }
}

export default withRouter(connect(mapStateToProps)(TitleBar));
