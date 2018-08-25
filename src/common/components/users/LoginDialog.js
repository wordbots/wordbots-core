import * as React from 'react';
import { object } from 'prop-types';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Snackbar from '@material-ui/core/Snackbar';

import { login, register, resetPassword } from '../../util/firebase.ts';
import RouterDialog from '../RouterDialog';

export default class LoginDialog extends React.Component {
  static propTypes = {
    history: object
  };

  state = {
    error: null,
    register: false,
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    snackbarText: '',
    snackbarOpen: false
  }

  get submitDisabled() {
    if (this.state.register) {
      return !this.notEmpty([this.state.email, this.state.username, this.state.password]);
    } else {
      return !this.notEmpty([this.state.email, this.state.password]);
    }
  }

  handleClose = () => {
    RouterDialog.closeDialog(this.props.history);
  }

  handleSnackbarClose = () => {
    this.setState({ snackbarOpen: false });
  }

  register = (email, username, password) => {
    register(email, username, password)
      .then(() => {
        this.setState({error: null});
        this.setState({
          error: null,
          snackbarOpen: true,
          snackbarText: `You have successfully registered as ${email}`
        });
        this.handleClose();
      })
      .catch(error => {
        this.setState({error: `Error: ${error.message}`});
      });
  }

  login = (email, password) => {
    login(email, password)
      .then(() => {
        this.setState({
          error: null,
          snackbarOpen: true,
          snackbarText: `You have successfully logged in as ${email}`
        });
        this.handleClose();
      })
      .catch(() => {
        this.setState({error: 'Error: Invalid username/password.'});
      });
  }

  resetPassword = (email) => {
    resetPassword(email)
      .then(() => { this.setState({error: `Password reset email sent to ${email}.`}); })
      .catch(() => { this.setState({error: 'Error: Email address not found.'}); });
  }

  handleKeyPress = (t) => {
    if (t.charCode === 13 && !this.submitDisabled) {
      this.handleSubmit();
    }
  }

  handleClickSwitchMode = () => {
    this.setState(state => ({register: !state.register}));
  }

  handleClickForgotPassword = () => {
    this.resetPassword(this.state.email);
  }

  handleChangeEmail = (e) => {
    this.setState({email: e.target.value});
  }

  handleChangeUsername = (e) => {
    this.setState({username: e.target.value});
  }

  handleChangePassword = (e) => {
    this.setState({password: e.target.value});
  }

  handleChangeConfirmPassword = (e) => {
    this.setState({confirmPassword: e.target.value});
  }

  handleSubmit = () => {
    if (this.state.register) {
      if (this.state.password === this.state.confirmPassword) {
        this.register(this.state.email, this.state.username, this.state.password);
      } else {
        this.setState({error: 'Error: Your passwords must match.'});
      }
    } else {
      this.login(this.state.email, this.state.password);
    }
  }

  notEmpty(fields) {
    return fields.reduce((base, field) => base && (field !== ''), true);
  }

  renderLoginForm() {
    return (
      <div style={{position: 'relative'}}>
        <div>
          <TextField
            value={this.state.email}
            style={{width: '100%'}}
            floatingLabelText="Email address"
            onKeyPress={this.handleKeyPress}
            onChange={this.handleChangeEmail} />
        </div>

        {
          this.state.register &&
          <div>
            <TextField
              value={this.state.username}
              style={{width: '100%'}}
              floatingLabelText="Username"
              onKeyPress={this.handleKeyPress}
              onChange={this.handleChangeUsername} />
          </div>
        }

        <div>
          <TextField
            value={this.state.password}
            style={{width: '100%'}}
            floatingLabelText="Password"
            type="password"
            onKeyPress={this.handleKeyPress}
            onChange={this.handleChangePassword} />
          {
            this.state.register &&
            <TextField
              value={this.state.confirmPassword}
              style={{width: '100%'}}
              floatingLabelText="Confirm Password"
              type="password"
              onKeyPress={this.handleKeyPress}
              onChange={this.handleChangeConfirmPassword} />
          }
        </div>

        {
          this.state.error &&
          <div style={{color: 'red', marginTop: 10, fontSize: 12}}>
            {this.state.error}
          </div>
        }
      </div>
    );
  }

  renderFormSwitcher() {
    return (
      <div style={{position: 'absolute', top: 30, right: 24, fontSize: 12}}>
        <span>
          {this.state.register ? 'Have an account?' : 'Don\'t have an account?'} &nbsp;
          <span
            style={{fontWeight: 'bold', cursor: 'pointer'}}
            onClick={this.handleClickSwitchMode}>
            {this.state.register ? 'Login' : 'Register'}
          </span>
        </span>
      </div>
    );
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        key="Cancel"
        primary
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="Forgot Password?"
        key="Forgot Password?"
        primary
        disabled={!this.notEmpty([this.state.email])}
        onTouchTap={this.handleClickForgotPassword}
      />,
      <FlatButton
        label={this.state.register ? 'Register' : 'Login'}
        key="Register/Login"
        primary
        disabled={this.submitDisabled}
        onTouchTap={this.handleSubmit}
      />
    ];

    if (this.state.register) {
      actions.splice(1, 1);
    }

    return (
      <React.Fragment>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          open={this.state.snackbarOpen}
          message={this.state.snackbarText}
          autoHideDuration={4000}
          onClose={this.handleSnackbarClose} />
        <RouterDialog
          modal
          path="login"
          title={this.state.register ? 'Register' : 'Login'}
          history={history}
          actions={actions}
          style={{width: 400, position: 'relative'}}
        >
          {this.renderLoginForm()}

          {this.renderFormSwitcher()}
        </RouterDialog>
      </React.Fragment>
    );
  }
}
