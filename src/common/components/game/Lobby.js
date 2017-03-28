import React, { Component } from 'react';
import Paper from 'material-ui/lib/paper';
import RaisedButton from 'material-ui/lib/raised-button';
import TextField from 'material-ui/lib/text-field';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import { shuffle } from 'lodash';

import { SHUFFLE_DECKS } from '../../constants';
import { instantiateCard } from '../../util/common';

export class Lobby extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gameName: '',
      selectedDeck: 0
    };
  }

  render() {
    const paperStyle = {padding: 20, marginBottom: 20, position: 'relative'};
    const buttonStyle = {position: 'absolute', top: 0, bottom: 0, right: 20, margin: 'auto', color: 'white'};

    const [numPlayersElt, waitingElt, chooseDeckElt, joinGamesElt, startNewGameElt] = [
      <Paper style={paperStyle}>
        <div>{this.props.socket.numPlayersOnline || 0} player(s) online</div>
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
          {numPlayersElt}
          {waitingElt}
        </div>
      );
    } else {
      return (
        <div>
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
  onHostGame: func
};

export default Lobby;
