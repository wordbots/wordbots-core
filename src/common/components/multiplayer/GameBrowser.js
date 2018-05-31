import React, { Component } from 'react';
import { arrayOf, bool, func, object } from 'prop-types';
import Paper from 'material-ui/Paper';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

import GameRow from './GameRow';

export default class GameBrowser extends Component {
  static propTypes = {
    openGames: arrayOf(object),
    inProgressGames: arrayOf(object),
    usernameMap: object,
    cannotJoinGame: bool,

    onJoinGame: func,
    onSpectateGame: func
  };

  get games() {
    return this.props.openGames.concat(this.props.inProgressGames);
  }

  renderTableRows() {
    const { usernameMap, cannotJoinGame, onJoinGame, onSpectateGame } = this.props;

    if (this.games.length > 0) {
      return (
        this.games.map(game =>
          <GameRow
            key={game.id}
            game={game}
            usernameMap={usernameMap}
            cannotJoinGame={cannotJoinGame}
            onJoinGame={onJoinGame}
            onSpectateGame={onSpectateGame} />
        )
      );
    } else {
      return (
        <TableRow>
          <TableRowColumn
            colSpan="3"
            style={{
              fontSize: 32,
              fontStyle: 'italic',
              fontWeight: 300,
              textAlign: 'center',
              padding: 24
            }}>No open games.</TableRowColumn>
        </TableRow>
      );
    }
  }

  render() {
    return (
      <Paper style={{
        marginBottom: 20
      }}>
        <Table fixedHeader>
          <TableHeader displaySelectAll={false}>
            <TableRow>
              <TableHeaderColumn>Game Name</TableHeaderColumn>
              <TableHeaderColumn>Format</TableHeaderColumn>
              <TableHeaderColumn>Players</TableHeaderColumn>
              <TableHeaderColumn>Spectators</TableHeaderColumn>
              <TableHeaderColumn />
            </TableRow>
          </TableHeader>
          <TableBody
            showRowHover
            stripedRows={false}
            displayRowCheckbox={false}>
            {this.renderTableRows()}
          </TableBody>
        </Table>
      </Paper>
    );
  }
}
