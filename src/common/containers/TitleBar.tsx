import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import * as fb from 'firebase';
import { History } from 'history';
import { red } from '@material-ui/core/colors';
import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import RouterDialog from '../components/RouterDialog';
import * as w from '../types';
import { isSupportedBrowser, toggleFlag } from '../util/browser';
import { logout } from '../util/firebase';

interface TitleBarProps extends TitleBarReduxProps {
  isAppLoading: boolean
  onRerender: () => void
}

interface TitleBarReduxProps {
  user: fb.User | null
}

interface TitleBarState {
  userOpen: boolean
  anchorEl: HTMLElement | undefined
}

function mapStateToProps(state: w.State): TitleBarReduxProps {
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
            style={{ color: 'white' }}
            onClick={this.toggleUserMenu}
          >
            {this.props.user.displayName}
            <Icon className="material-icons" style={{ margin: '0 5px 0 8px' }}>account_circle</Icon>
          </Button>
          <Popover
            open={this.state.userOpen}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
            onClose={this.closeUserMenu}
            style={{ marginLeft: 15, marginTop: 12 }}
            PaperProps={{
              style: { borderRadius: 0 }
            }}
          >
            <div>
              <MenuItem
                style={{
                  marginTop: 1,
                  border: `1px solid ${red[500]}`,
                  borderRight: 0,
                  boxShadow: '1px 1px 5px #666b'
                }}
                onClick={this.handleClickProfile}
              >
                <ListItemIcon>
                  <Icon className="material-icons">account_circle</Icon>
                </ListItemIcon>
                <ListItemText
                  style={{ padding: '0 8px' }}
                  primaryTypographyProps={{
                    style: { fontFamily: '"Carter One"', color: '#666', textTransform: 'uppercase' }
                  }}
                >
                  Profile
                </ListItemText>
              </MenuItem>
              <MenuItem
                style={{
                  marginTop: 1,
                  border: `1px solid ${red[500]}`,
                  borderRight: 0,
                  boxShadow: '1px 1px 5px #666b'
                }}
                onClick={this.handleClickLogout}
              >
                <ListItemIcon>
                  <Icon className="material-icons">exit_to_app</Icon>
                </ListItemIcon>
                <ListItemText
                  style={{ padding: '0 8px' }}
                  primaryTypographyProps={{
                    style: { fontFamily: '"Carter One"', color: '#666', textTransform: 'uppercase' }
                  }}
                >
                  Logout
                </ListItemText>
              </MenuItem>
            </div>
          </Popover>
        </div>
      );
    } else {
      return (
        <Button
          style={{ color: 'white' }}
          onClick={this.openLoginDialog}
        >
          Login / Register
          <Icon className="material-icons" style={{ margin: '0 5px 0 10px' }}>person</Icon>
        </Button>
      );
    }
  }

  public renderStaticTitleBar(): JSX.Element {
    return (
      <header style={{
        height: 64,
        backgroundColor: '#f44336',
        boxShadow: '0 1px 6px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.12)',
      }}>
        <div style={{
          paddingLeft: 15,
          paddingTop: 7,
          fontFamily: 'Carter One',
          fontSize: 32,
          color: 'white',
        }}>
          WORDBOTS
        </div>
      </header>
    );
  }

  public renderUnsupportedBrowserMessage(): JSX.Element | undefined {
    if (!isSupportedBrowser()) {
      return (
        <div style={{
          display: 'flex',
          width: '100%',
          height: 30,
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: 'yellow',
          padding: 10,
          color: 'black',
          fontSize: '0.85em'
        }}>
          <span>
            It appears that you are using an unsupported browser.
            Wordbots requires Firefox 49+, Chrome 53+, Safari 10+, Edge 79+, or a similar browser for optimal performance.{' '}
            <a
              style={{ cursor: 'pointer', color: '#666', textDecoration: 'underline' }}
              onClick={this.handleClickHideUnsupportedBrowserMessage}
            >[hide this message]</a>
          </span>
        </div>
      );
    }
  }

  public render(): JSX.Element {
    if (this.props.isAppLoading) {
      return this.renderStaticTitleBar();
    } else {
      return (
        <div style={{height: 64}}>
          <AppBar
            position="fixed"
            style={{
              boxShadow: '0 1px 6px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.12)'
            }}
          >
            {this.renderUnsupportedBrowserMessage()}
            <Toolbar
              disableGutters
              style={{
                padding: '0 7px 0 15px',
                justifyContent: 'space-between'
              }}
            >
              <Typography style={{ fontFamily: 'Carter One', fontSize: 32 }}>
                <Link className="wordbotsAppBarLink" to="/">WORDBOTS</Link>
              </Typography>
              {this.userMenu}
            </Toolbar>
          </AppBar>
        </div>
      );
    }
  }

  private openLoginDialog = () => {
    RouterDialog.openDialog(this.props.history, 'login');
  }

  private toggleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();

    if (this.state.userOpen) {
      this.closeUserMenu();
    } else {
      this.setState({
        userOpen: true,
        anchorEl: event.currentTarget
      });
    }
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

  private handleClickHideUnsupportedBrowserMessage = () => {
    toggleFlag("hideUnsupportedBrowserMessage");
    this.props.onRerender();
  }
}

export default withRouter(connect(mapStateToProps)(TitleBar));
