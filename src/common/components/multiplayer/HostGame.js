import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

class HostGame extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gameName: ''
    };
  }

  render() {
    return (
      <Paper style={{padding: 20, marginBottom: 20, position: 'relative'}}>
        <TextField
          value={this.state.gameName}
          floatingLabelText="Game name"
          style={{width: '50%'}}
          onChange={e => { this.setState({gameName: e.target.value}); }} />
        <div style={{position: 'absolute', top: 0, bottom: 0, right: 20, height: 36, margin: 'auto', color: 'white'}}>
          <RaisedButton
            secondary
            disabled={this.state.gameName === ''}
            label="Host New Game"
            onTouchTap={() => { this.props.onHostGame(this.state.gameName); }} />
        </div>
      </Paper>
    );
  }
}

const { func } = React.PropTypes;

HostGame.propTypes = {
  onHostGame: func
};

export default HostGame;
