import * as React from 'react';
import { func, object, string } from 'prop-types';
import Button from '@material-ui/core/Button';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import FontIcon from 'material-ui/FontIcon';

import { guestUID } from '../../../util/multiplayer.ts';
import { GameFormat } from '../../../store/gameFormats.ts';

export default class GameRow extends React.Component {
  static propTypes = {
    game: object,
    user: object,
    clientId: string,
    userDataByClientId: object,

    onCancelHostGame: func,
    onJoinGame: func,
    onSpectateGame: func
  };

  get myUID() {
    const { clientId, user } = this.props;
    if (user) {
      return user.uid;
    } else {
      return guestUID(clientId);
    }
  }

  get isMyGame() {
    const { game, userDataByClientId } = this.props;
    return game.players.some(clientId =>
      userDataByClientId[clientId] && userDataByClientId[clientId].uid === this.myUID
    );
  }

  handleJoinGame = () => {
    const { game: { id, name, format, options }, onJoinGame } = this.props;

    onJoinGame(id, name, GameFormat.fromString(format), options);
  };

  handleSpectateGame = () => {
    const { game, onSpectateGame } = this.props;
    onSpectateGame(game.id, game.name);
  };

  renderPlayerName = (clientId) => {
    const { userDataByClientId } = this.props;
    const userData = userDataByClientId[clientId];
    if (userData) {
      return (userData.uid === this.myUID) ? 'Me' : userData.displayName;
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
          title={game.options.passwordToJoin ? 'This game requires a password to join.' : ''}
        >
          Join Game
          {game.options.passwordToJoin &&
            <FontIcon
              className="material-icons"
              color="white"
              style={{ marginLeft: 5 }}
            >
              vpn_key
            </FontIcon>
          }
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
