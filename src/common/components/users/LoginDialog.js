import React, {Component} from 'react';
import {object} from 'prop-types';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import {login, register, resetPassword} from '../../util/firebase';
import RouterDialog from '../RouterDialog';

export default class LoginDialog extends Component {
  static propTypes = {
    history: object
  };

  constructor (props) {
    super(props);

    this.state = {
      error: null,
      register: false,
      email: '',
      username: '',
      password: ''
    };
  }

  handleClose = () => {
    RouterDialog.closeDialog(this.props.history);
  };

  register = (email, username, password) => {
    register(email, username, password)
      .then(() => {
        this.setState({error: null});
        this.handleClose();
      })
      .catch(err => {
        this.setState({error: `Error: ${err.message}`});
      });
  };

  login = (email, password) => {
    login(email, password)
      .then(() => {
        this.setState({error: null});
        this.handleClose();
      })
      .catch(() => {
        this.setState({error: 'Error: Invalid username/password.'});
      });
  };

  resetPassword = email => {
    resetPassword(email)
      .then(() => {
        this.setState({error: `Password reset email sent to ${email}.`});
      })
      .catch(() => {
        this.setState({error: 'Error: Email address not found.'});
      });
  };

  handleKeyPress (t) {
    if (t.charCode === 13 && !this.submitDisabled()) {
      this.submit();
    }
  }

  notEmpty (fields) {
    return fields.reduce((base, field) => base && field !== '', true);
  }

  submitDisabled () {
    if (this.state.register) {
      return !this.notEmpty([ this.state.email, this.state.username, this.state.password ]);
    } else {
      return !this.notEmpty([ this.state.email, this.state.password ]);
    }
  }

  submit () {
    if (this.state.register) {
      this.register(this.state.email, this.state.username, this.state.password);
    } else {
      this.login(this.state.email, this.state.password);
    }
  }

  renderLoginForm () {
    return (
      <div style={{position: 'relative'}}>
        <div>
          <TextField
            value={this.state.email}
            style={{width: '100%'}}
            floatingLabelText="Email address"
            onKeyPress={t => this.handleKeyPress(t)}
            onChange={e => this.setState({email: e.target.value})}
          />
        </div>

        {this.state.register && (
          <div>
            <TextField
              value={this.state.username}
              style={{width: '100%'}}
              floatingLabelText="Username"
              onKeyPress={t => this.handleKeyPress(t)}
              onChange={e => {
                this.setState({username: e.target.value});
              }}
            />
          </div>
        )}

        <div>
          <TextField
            value={this.state.password}
            style={{width: '100%'}}
            floatingLabelText="Password"
            type="password"
            onKeyPress={t => this.handleKeyPress(t)}
            onChange={e => this.setState({password: e.target.value})}
          />
        </div>

        {this.state.error && (
          <div style={{color: 'red', marginTop: 10, fontSize: 12}}>{this.state.error}</div>
        )}
      </div>
    );
  }

  renderFormSwitcher () {
    return (
      <div style={{position: 'absolute', top: 30, right: 24, fontSize: 12}}>
        <span>
          {this.state.register ? 'Have an account?' : "Don't have an account?"} &nbsp;
          <span
            style={{fontWeight: 'bold', cursor: 'pointer'}}
            onClick={() => this.setState({register: !this.state.register})}
          >
            {this.state.register ? 'Login' : 'Register'}
          </span>
        </span>
      </div>
    );
  }

  render () {
    const actions = [
      <FlatButton label="Cancel" key="Cancel" primary onTouchTap={this.handleClose} />,
      <FlatButton
        label="Forgot Password?"
        key="Forgot Password?"
        primary
        disabled={!this.notEmpty([ this.state.email ])}
        onTouchTap={() => this.resetPassword(this.state.email)}
      />,
      <FlatButton
        label={this.state.register ? 'Register' : 'Login'}
        key="Register/Login"
        primary
        disabled={this.submitDisabled()}
        onTouchTap={() => this.submit()}
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
