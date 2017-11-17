import React, { Component } from 'react';
import { bool, func } from 'prop-types';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

export default class HostGame extends Component {
  static propTypes = {
    disabled: bool,
    onHostGame: func
  };

  state = {
    gameName: ''
  };

  handleSetGameName = (evt) => {
    this.setState({gameName: evt.target.value});
  };

  handleHostGame = () => {
    this.props.onHostGame(this.state.gameName);
  };

  render = () => (
    <Paper style={{padding: 20, marginBottom: 20, position: 'relative'}}>
      <TextField
        disabled={this.props.disabled}
        value={this.state.gameName}
        floatingLabelText="Game name"
        style={{width: '50%'}}
        onChange={this.handleSetGameName} />
      <div style={{position: 'absolute', top: 0, bottom: 0, right: 20, height: 36, margin: 'auto', color: 'white'}}>
        <RaisedButton
          secondary
          disabled={this.props.disabled || this.state.gameName === ''}
          label="Host New Game"
          onTouchTap={this.handleHostGame} />
      </div>
    </Paper>
  );
}
