import React, { Component } from 'react';
import { array, bool, func, object } from 'prop-types';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

export default class GameBrowser extends Component {
  static propTypes = {
    openGames: array,
    inProgressGames: array,
    usernameMap: object,
    cannotJoinGame: bool,

    onJoinGame: func,
    onSpectateGame: func
  };

  get games() {
    return this.props.openGames.concat(this.props.inProgressGames);
  }

  renderTableRows() {
    if (this.games.length > 0) {
      return (
        this.games.map(game =>
          <TableRow key={game.id}>
            <TableRowColumn>{game.name}</TableRowColumn>
            <TableRowColumn>{game.players.map(p => this.props.usernameMap[p]).join(', ')}</TableRowColumn>
            <TableRowColumn>{(game.spectators || []).map(p => this.props.usernameMap[p]).join(', ')}</TableRowColumn>
            <TableRowColumn style={{textAlign: 'right'}}>
              { game.players.length === 1 ?
                <RaisedButton
                  secondary
                  label="Join Game"
                  disabled={this.props.cannotJoinGame}
                  onTouchTap={() => { this.props.onJoinGame(game.id, game.name); }} /> :
                <RaisedButton
                  secondary
                  label="Spectate Game"
                  onTouchTap={() => { this.props.onSpectateGame(game.id, game.name); }} />
              }
            </TableRowColumn>
          </TableRow>
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
