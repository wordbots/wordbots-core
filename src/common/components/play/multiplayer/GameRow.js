import * as React from 'react';
import { func, object } from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
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
        <RaisedButton
          secondary
          label="Join Game"
          onTouchTap={this.handleJoinGame} /> :
        <RaisedButton
          secondary
          label="Spectate Game"
          onTouchTap={this.handleSpectateGame} />;
    } else {
      return (
        <RaisedButton
          secondary
          label="Cancel Game"
          onTouchTap={this.props.onCancelHostGame} />
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
