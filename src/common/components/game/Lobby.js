import React, { Component } from 'react';
import Paper from 'material-ui/lib/paper';
import RaisedButton from 'material-ui/lib/raised-button';
import TextField from 'material-ui/lib/text-field';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import { debounce, filter, shuffle } from 'lodash';

import { SHUFFLE_DECKS } from '../../constants';
import { instantiateCard } from '../../util/common';

export class Lobby extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: props.socket.username,
      gameName: '',
      selectedDeck: 0
    };

    this.setUsername = debounce(username => {
      this.props.onSetUsername(username);
    }, 500);
  }

  componentDidMount() {
    if (this.props.socket.username) {
      this.props.onSetUsername(this.props.socket.username);
    }
  }

  componentWillUpdate(nextProps) {
    // Default username to clientId.
    if (!this.state.username && nextProps.socket.clientId) {
      this.state.username = nextProps.socket.clientId;
      this.props.onSetUsername(nextProps.socket.clientId);
    }
  }

  render() {
    const paperStyle = {padding: 20, marginBottom: 20, position: 'relative'};
    const buttonStyle = {position: 'absolute', top: 0, bottom: 0, right: 20, margin: 'auto', color: 'white'};

    const [usernameElt, numPlayersElt, waitingElt, chooseDeckElt, joinGamesElt, startNewGameElt] = [
      <Paper style={paperStyle}>
        <div>Your username is:
          <TextField
            value={this.state.username}
            style={{marginLeft: 12, width: '50%'}}
            onChange={e => {
              this.setState({username: e.target.value});
              this.setUsername(e.target.value);
            }} />
        </div>
      </Paper>,

      <Paper style={paperStyle}>
        <div>
          <b>{this.props.socket.playersOnline.length} player(s) online: </b>
          {filter(this.props.socket.playersOnline.map(p => this.props.socket.clientIdToUsername[p])).join(', ')}
        </div>
      </Paper>,

      <Paper style={paperStyle}>
        <div>Waiting for an opponent ...</div>
      </Paper>,

      <Paper style={paperStyle}>
        <SelectField
          value={this.state.selectedDeck}
          floatingLabelText="Choose a deck"
          style={{width: '80%', marginRight: 25}}
          onChange={(e, idx, v) => { this.setState({selectedDeck: idx}); }}>
          {this.props.availableDecks.map((deck, idx) =>
            <MenuItem key={idx} value={idx} primaryText={`${deck.name} (${deck.cards.length} cards)`}/>
          )}
        </SelectField>
      </Paper>,

      this.props.socket.waitingPlayers.map(game =>
        <Paper style={paperStyle} key={game.id}>
          <div>
            <b>{game.name}</b>
          </div>
          <RaisedButton
            secondary
            label="Join Game"
            style={buttonStyle}
            onTouchTap={e => {
              const deck = this.props.availableDecks[this.state.selectedDeck].cards.map(instantiateCard);
              this.props.onJoinGame(game.id, SHUFFLE_DECKS ? shuffle(deck) : deck);
            }} />
        </Paper>
      ),

      <Paper style={paperStyle}>
        <TextField
          value={this.state.gameName}
          floatingLabelText="Game name"
          style={{width: '50%'}}
          onChange={e => { this.setState({gameName: e.target.value}); }} />
        <RaisedButton
          secondary
          disabled={this.state.gameName === ''}
          label="Host New Game"
          style={buttonStyle}
          onTouchTap={e => {
            const deck = this.props.availableDecks[this.state.selectedDeck].cards.map(instantiateCard);
            this.props.onHostGame(this.state.gameName, SHUFFLE_DECKS ? shuffle(deck) : deck);
          }} />
      </Paper>
    ];

    if (this.props.socket.hosting) {
      return (
        <div>
          {usernameElt}
          {numPlayersElt}
          {waitingElt}
        </div>
      );
    } else {
      return (
        <div>
          {usernameElt}
          {numPlayersElt}
          {chooseDeckElt}
          {joinGamesElt}
          {startNewGameElt}
        </div>
      );
    }
  }
}

const { array, func, object } = React.PropTypes;

Lobby.propTypes = {
  socket: object,
  availableDecks: array,

  onJoinGame: func,
  onHostGame: func,
  onSetUsername: func
};

export default Lobby;
