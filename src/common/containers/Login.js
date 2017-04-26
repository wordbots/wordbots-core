import React, { Component } from 'react';
import { bool } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { login, register, resetPassword } from '../util/firebase';
import LoginForm from '../components/users/LoginForm';
import RegisterForm from '../components/users/RegisterForm';

export function mapStateToProps(state) {
  return {
    sidebarOpen: state.global.sidebarOpen
  };
}

class Login extends Component {
  static propTypes = {
    sidebarOpen: bool
  };

  constructor() {
    super();

    this.state = {
      loginError: null,
      registerError: null
    };
  }

  register = (email, username, password) => {
    register(email, username, password)
      .then(e => { this.setState({registerError: null}); })
      .catch(e => { this.setState({registerError: e.message}); });
  }

  login = (email, password) => {
    login(email, password)
      .then(e => { this.setState({loginError: null}); })
      .catch(() => { this.setState({loginError: 'Invalid username/password.'}); });
  }

  resetPassword = (email) => {
    resetPassword(email)
      .then(() => { this.setState({loginError: `Password reset email sent to ${email}.`}); })
      .catch(e => { this.setState({loginError: 'Email address not found.'}); });
  }

  paperStyle = {
    float: 'left',
    width: '30%',
    height: 200,
    margin: 20,
    padding: 20
  }

  render() {
    return (
      <div style={{
        paddingLeft: this.props.sidebarOpen ? 256 : 0,
        margin: '48px 72px'
      }}>
        <Helmet title="Login"/>

        <LoginForm
          error={this.state.loginError}
          onLogin={this.login}
          onResetPassword={this.resetPassword} />

        <RegisterForm
          error={this.state.registerError}
          onRegister={this.register} />
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps)(Login));
