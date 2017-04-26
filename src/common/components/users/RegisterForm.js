import React, { Component } from 'react';
import { func, string } from 'prop-types';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

export default class Register extends Component {
  static propTypes = {
    error: string,
    onRegister: func
  };

  constructor() {
    super();

    this.state = {
      email: '',
      username: '',
      password: ''
    };
  }

  render() {
    return (
      <Paper style={{
        float: 'left',
        width: '40%',
        height: 370,
        margin: 20,
        padding: 20
      }}>
        <div style={{
          fontWeight: 100,
          fontSize: 28
        }}>Register</div>

        <TextField
          value={this.state.email}
          floatingLabelText="Email address"
          onChange={e => { this.setState({email: e.target.value}); }} />
        <TextField
          value={this.state.username}
          floatingLabelText="Username"
          onChange={e => { this.setState({username: e.target.value}); }} />
        <TextField
          value={this.state.password}
          floatingLabelText="Password"
          type="password"
          onChange={e => { this.setState({password: e.target.value}); }} />

        {
          this.props.error &&
          <div style={{color: 'red', marginTop: 10}}>
            Error: {this.props.error}
          </div>
        }

        <div style={{marginTop: 10}}>
          <RaisedButton
            primary
            label="Register"
            style={{width: 150}}
            onTouchTap={() => {
              this.props.onRegister(this.state.email, this.state.username, this.state.password);
            }} />
        </div>
      </Paper>
    );
  }
}
