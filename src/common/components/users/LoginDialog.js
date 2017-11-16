import React, { Component } from 'react';
import { object } from 'prop-types';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import { login, register, resetPassword } from '../../util/firebase';
import RouterDialog from '../RouterDialog';

export default class LoginDialog extends Component {
  static propTypes = {
    history: object
  };

  state = {
    error: null,
    register: false,
    email: '',
    username: '',
    password: ''
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

  register = (email, username, password) => {
    register(email, username, password)
      .then(() => {
        this.setState({error: null});
        this.handleClose();
      })
      .catch(err => {
        this.setState({error: `Error: ${err.message}`});
      });
  }

  login = (email, password) => {
    login(email, password)
      .then(() => {
        this.setState({error: null});
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
      this.submit();
    }
  }

  handleClickSwitchMode = () => {
    this.setState({register: !this.state.register});
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

  notEmpty(fields) {
    return fields.reduce((base, field) => base && (field !== ''), true);
  }

  submit() {
    if (this.state.register) {
      this.register(this.state.email, this.state.username, this.state.password);
    } else {
      this.login(this.state.email, this.state.password);
    }
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
        onTouchTap={this.submit}
      />
    ];

    if (this.state.register) {
      actions.splice(1, 1);
    }

    return (
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
    );
  }
}
