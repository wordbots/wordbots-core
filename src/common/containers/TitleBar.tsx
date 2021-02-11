import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Popover from '@material-ui/core/Popover';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import * as fb from 'firebase';
import { History } from 'history';
import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import RouterDialog from '../components/RouterDialog';
import { MAX_Z_INDEX } from '../constants';
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
        <div style={{marginTop: 4}}>
          <Button
            style={{color: 'white'}}
            onClick={this.openUserMenu}
          >
            {this.props.user.displayName}
            <Icon className="material-icons" style={{ margin: '0 5px 0 8px' }}>account_circle</Icon>
          </Button>
          <Popover
            open={this.state.userOpen}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
            onClose={this.closeUserMenu}
            style={{ zIndex: MAX_Z_INDEX, marginTop: 5 }}
          >
            <MenuList>
              <MenuItem onClick={this.handleClickProfile}>
                <ListItemIcon>
                  <Icon className="material-icons">account_circle</Icon>
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>
              <MenuItem onClick={this.handleClickLogout}>
                <ListItemIcon>
                  <Icon className="material-icons">exit_to_app</Icon>
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </MenuList>
          </Popover>
        </div>
      );
    } else {
      return (
        <Button
          onClick={this.openLoginDialog}
        >
          Login / Register
          <Icon className="material-icons" style={{ margin: '0 5px 0 10px' }}>person</Icon>
        </Button>
      );
    }
  }

  public render(): JSX.Element {
    return (
      <div style={{height: 64}}>
        <AppBar
          position="fixed"
          style={{
            boxShadow: '0 1px 6px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.12)'
          }}
        >
          <Toolbar
            disableGutters
            style={{
              padding: '0 7px 0 15px',
              justifyContent: 'space-between'
            }}
          >
            <Typography style={{ fontFamily: 'Carter One', fontSize: 32 }}>
              <Link to="/" style={{ color: 'white' }}>WORDBOTS</Link>
            </Typography>
            {this.userMenu}
          </Toolbar>
        </AppBar>
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
