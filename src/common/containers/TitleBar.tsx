import AppBar from '@material-ui/core/AppBar';
import Backdrop from '@material-ui/core/Backdrop';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import * as fb from 'firebase';
import { History } from 'history';
import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import RouterDialog from '../components/RouterDialog';
import * as w from '../types';
import { logout } from '../util/firebase';
import { DIALOG_Z_INDEX, HEADER_HEIGHT, UNSUPPORTED_BROWSER_MESSAGE_HEIGHT } from '../constants';
import UserMenuItem from '../components/UserMenuItem';

interface TitleBarProps extends TitleBarReduxProps {
  isAppLoading: boolean
  isUnsupportedBrowser: boolean
  onHideUnsupportedBrowserMessage: () => void
}

interface TitleBarReduxProps {
  user: fb.User | null
}

interface TitleBarState {
  isUserMenuOpen: boolean
}

function mapStateToProps(state: w.State): TitleBarReduxProps {
  return {
    user: state.global.user
  };
}

class TitleBar extends React.Component<TitleBarProps & { history: History }, TitleBarState> {
  public state = {
    isUserMenuOpen: false,
  };

  get userMenu(): JSX.Element {
    const { isUnsupportedBrowser } = this.props;
    const { isUserMenuOpen } = this.state;

    if (this.props.user) {
      return (
        <div style={{ marginTop: 4 }}>
          <Button
            style={{ color: 'white' }}
            onClick={this.toggleUserMenu}
          >
            {this.props.user.displayName}
            <AccountCircleIcon style={{ margin: '0 5px 0 8px' }} />
          </Button>
          {isUserMenuOpen &&
            <>
              <Backdrop open invisible onClick={this.closeUserMenu} />
              <div
                style={{
                  position: 'fixed',
                  top: HEADER_HEIGHT + (isUnsupportedBrowser ? UNSUPPORTED_BROWSER_MESSAGE_HEIGHT : 0),
                  right: 0,
                  background: 'white'
                }}>
                <UserMenuItem text="Profile" icon={<AccountCircleIcon />} onClick={this.handleClickProfile} />
                <UserMenuItem text="Logout" icon={<ExitToAppIcon />} onClick={this.handleClickLogout} />
              </div>
            </>
          }
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
          paddingBottom: 7,
          fontFamily: '"Carter One", "Carter One-fallback"',
          fontSize: 32,
          color: 'white',
        }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <a href="/">
              <img src="/static/onebot-light.png" style={{ width: 40, height: 40, marginTop: 5, marginRight: 8 }} />
            </a>
            <div style={{ marginTop: -9 }}>
              <a href="/" style={{ color: 'white', fontWeight: 'normal', textDecoration: 'none' }}>WORDBOTS</a>
            </div>
          </span>
        </div>
      </header>
    );
  }

  public renderUnsupportedBrowserMessage(): JSX.Element | undefined {
    const { isUnsupportedBrowser, onHideUnsupportedBrowserMessage } = this.props;
    if (isUnsupportedBrowser) {
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
              onClick={onHideUnsupportedBrowserMessage}
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
        <div style={{ height: 64 }}>
          <AppBar
            position="fixed"
            style={{
              boxShadow: '0 1px 6px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.12)',
              zIndex: DIALOG_Z_INDEX
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
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <Link className="wordbotsAppBarLink" to="/">
                  <img src="/static/onebot-light.png" style={{ width: 40, height: 40, marginTop: 3, marginRight: 8 }} />
                </Link>
                <Typography style={{ fontFamily: '"Carter One", "Carter One-fallback"', fontSize: 32 }}>
                  <Link className="wordbotsAppBarLink" to="/">WORDBOTS</Link>
                </Typography>
              </span>
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

    if (this.state.isUserMenuOpen) {
      this.closeUserMenu();
    } else {
      this.setState({ isUserMenuOpen: true });
    }
  }

  private closeUserMenu = () => {
    this.setState({ isUserMenuOpen: false });
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
