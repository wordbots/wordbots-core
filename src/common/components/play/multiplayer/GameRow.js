import * as React from 'react';
import { func, object } from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import { TableRow, TableRowColumn } from 'material-ui/Table';

import { GameFormat } from '../../../store/gameFormats.ts';

export default class GameRow extends React.Component {
  static propTypes = {
    game: object,
    usernameMap: object,

    onJoinGame: func,
    onSpectateGame: func
  };

  handleJoinGame = () => {
    const { game: { id, name, format }, onJoinGame } = this.props;
    onJoinGame(id, name, GameFormat.fromString(format));
  };

  handleSpectateGame = () => {
    const { game, onSpectateGame } = this.props;
    onSpectateGame(game.id, game.name);
  };

  render() {
    const { game, usernameMap } = this.props;
    return (
      <TableRow key={game.id}>
        <TableRowColumn>{game.name}</TableRowColumn>
        <TableRowColumn>{GameFormat.fromString(game.format).displayName}</TableRowColumn>
        <TableRowColumn>{game.players.map(p => usernameMap[p]).join(', ')}</TableRowColumn>
        <TableRowColumn>{(game.spectators || []).map(p => usernameMap[p]).join(', ')}</TableRowColumn>
        <TableRowColumn style={{textAlign: 'right'}}>
          { game.players.length === 1 ?
            <RaisedButton
              secondary
              label="Join Game"
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
