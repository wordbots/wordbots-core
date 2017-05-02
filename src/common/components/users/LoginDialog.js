import React, { Component } from 'react';
import { bool, func } from 'prop-types';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import { login, register, resetPassword } from '../../util/firebase';

export default class LoginDialog extends Component {
  static propTypes = {
    loginOpen: bool,
    handleClose: func 
  };

  constructor(props) {
    super(props);

    this.state = {
      error: null,
      register: false,
      email: '',
      username: '',
      password: ''
    };
  }

  register = (email, username, password) => {
    register(email, username, password)
      .then(e => { 
        this.setState({error: null}); 
        this.props.handleClose();
      })
      .catch(e => { 
        this.setState({error: e.message}); 
      });
  }

  login = (email, password) => {
    login(email, password)
      .then(e => { 
        this.setState({error: null}); 
        this.props.handleClose();
      })
      .catch(() => { 
        this.setState({error: 'Invalid username/password.'}); 
      });
  }

  resetPassword = (email) => {
    resetPassword(email)
      .then(() => { this.setState({error: `Password reset email sent to ${email}.`}); })
      .catch(e => { this.setState({error: 'Email address not found.'}); });
  }

  handleKeyPress(t) {
    if (t.charCode === 13 && !this.submitDisabled()) {
      this.submit();
    }
  }

  notEmpty(fields) {
    return fields.reduce((base, field) => base && (field !== ''), true);
  }

  submitDisabled() {
    if (this.state.register) {
      return !this.notEmpty([this.state.email, this.state.username, this.state.password]);
    } else {
      return !this.notEmpty([this.state.email, this.state.password]);
    }
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
            onKeyPress={(t) => this.handleKeyPress(t)}
            onChange={e => this.setState({email: e.target.value})} />
        </div>

        {
          this.state.register &&
          <div>
            <TextField
              value={this.state.username}
              style={{width: '100%'}}
              floatingLabelText="Username"
              onKeyPress={(t) => this.handleKeyPress(t)}
              onChange={e => { this.setState({username: e.target.value}); }} />
          </div>
        }

        <div>
          <TextField
            value={this.state.password}
            style={{width: '100%'}}
            floatingLabelText="Password"
            type="password"
            onKeyPress={(t) => this.handleKeyPress(t)}
            onChange={e => this.setState({password: e.target.value})} />
        </div>

        {
          this.state.error &&
          <div style={{color: 'red', marginTop: 10, fontSize: 12}}>
            Error: {this.state.error}
          </div>
        }
      </div>
    );
  }

  renderFormSwitcher() {
    if (this.state.register) {
      return (
        <div style={{position: 'absolute', top: 30, right: 24, fontSize: 12}}>
          <span>
            Have an account? &nbsp; 
            <span 
              style={{fontWeight: 'bold', cursor: 'pointer'}} 
              onClick={() => this.setState({register: false})}>
              Login
            </span>
          </span>
        </div>
      );
    } else {
      return (
        <div style={{position: 'absolute', top: 30, right: 24, fontSize: 12}}>
          <span>
            Don't have an account? &nbsp; 
            <span 
              style={{fontWeight: 'bold', cursor: 'pointer'}} 
              onClick={() => this.setState({register: true})}>
              Register
            </span>
          </span>
        </div>
      );
    }
  }

  render() {
    const loginActions = [
      <FlatButton
        label="Cancel"
        primary
        onTouchTap={() => this.props.handleClose()}
      />,
      <FlatButton
        label="Forgot Password?"
        primary
        disabled={!this.notEmpty([this.state.email])}
        onTouchTap={() => this.resetPassword(this.state.email)}
      />,
      <FlatButton
        label={this.state.register ? 'Register' : 'Login'}
        primary
        disabled={this.submitDisabled()}
        onTouchTap={() => this.submit()}
      />
    ];

    if (this.state.register) {
      loginActions.splice(1, 1);
    }

    return (
      <Dialog
        title={this.state.register ? 'Register' : 'Login'}
        actions={loginActions}
        modal
        contentStyle={{width: 400, position: 'relative'}}
        open={this.props.loginOpen}>

        {this.renderLoginForm()}

        {this.renderFormSwitcher()}
      </Dialog>
    );
  }
}
