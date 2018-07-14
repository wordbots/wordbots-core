import * as React from 'react';
import { func, object } from 'prop-types';
import Button from '@material-ui/core/Button';
import { TableRow, TableRowColumn } from 'material-ui/Table';

import { GameFormat } from '../../../store/gameFormats.ts';

export default class GameRow extends React.Component {
  static propTypes = {
    game: object,
    user: object,
    userDataByClientId: object,

    onCancelHostGame: func,
    onJoinGame: func,
    onSpectateGame: func
  };

  get isMyGame() {
    const { game, user, userDataByClientId } = this.props;
    return game.players.some(clientId =>
      userDataByClientId[clientId] && userDataByClientId[clientId].uid === user.uid
    );
  }

  handleJoinGame = () => {
    const { game: { id, name, format }, onJoinGame } = this.props;
    onJoinGame(id, name, GameFormat.fromString(format));
  };

  handleSpectateGame = () => {
    const { game, onSpectateGame } = this.props;
    onSpectateGame(game.id, game.name);
  };

  renderPlayerName = (clientId) => {
    const { user, userDataByClientId } = this.props;
    const userData = userDataByClientId[clientId];
    if (userData) {
      return userData.uid === user.uid ? 'Me' : userData.displayName;
    } else {
      return clientId;
    }
  }

  renderButtons = () => {
    const { game } = this.props;
    if (!this.isMyGame) {
      return (game.players.length === 1) ?
        <Button
          variant="raised"
          color="secondary"
          onTouchTap={this.handleJoinGame}
        >
          Join Game
        </Button> :
        <Button
          variant="raised"
          color="secondary"
          onTouchTap={this.handleSpectateGame}
        >
          Spectate Game
        </Button>;
    } else {
      return (
        <Button
          variant="outlined"
          color="secondary"
          onTouchTap={this.props.onCancelHostGame}
        >
          Cancel Game
        </Button>
      );
    }
  }

  render() {
    const { game } = this.props;
    return (
      <TableRow key={game.id} selected={this.isMyGame}>
        <TableRowColumn>{game.name}</TableRowColumn>
        <TableRowColumn>{GameFormat.fromString(game.format).displayName}</TableRowColumn>
        <TableRowColumn>{game.players.map(this.renderPlayerName).join(', ')}</TableRowColumn>
        <TableRowColumn>{(game.spectators || []).map(this.renderPlayerName).join(', ')}</TableRowColumn>
        <TableRowColumn style={{textAlign: 'right'}}>
          {this.renderButtons()}
        </TableRowColumn>
      </TableRow>
    );
  }
}
