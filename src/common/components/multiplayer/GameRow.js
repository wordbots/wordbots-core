import React, { Component } from 'react';
import { bool, func, object } from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import { TableRow, TableRowColumn } from 'material-ui/Table';

export default class GameRow extends Component {
  static propTypes = {
    game: object,
    usernameMap: object,
    cannotJoinGame: bool,

    onJoinGame: func,
    onSpectateGame: func
  };

  handleJoinGame = () => {
    const { game, onJoinGame } = this.props;
    onJoinGame(game.id, game.name);
  };

  handleSpectateGame = () => {
    const { game, onSpectateGame } = this.props;
    onSpectateGame(game.id, game.name);
  };

  render() {
    const { cannotJoinGame, game, usernameMap } = this.props;
    return (
      <TableRow key={game.id}>
        <TableRowColumn>{game.name}</TableRowColumn>
        <TableRowColumn>{game.players.map(p => usernameMap[p]).join(', ')}</TableRowColumn>
        <TableRowColumn>{(game.spectators || []).map(p => usernameMap[p]).join(', ')}</TableRowColumn>
        <TableRowColumn style={{textAlign: 'right'}}>
          { game.players.length === 1 ?
            <RaisedButton
              secondary
              label="Join Game"
              disabled={cannotJoinGame}
              onTouchTap={this.handleJoinGame} /> :
            <RaisedButton
              secondary
              label="Spectate Game"
              onTouchTap={this.handleSpectateGame} />
          }
        </TableRowColumn>
      </TableRow>
    );
  }
}
