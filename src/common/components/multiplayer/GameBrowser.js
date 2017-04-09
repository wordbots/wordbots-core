import React, { Component } from 'react';
import { array, func, object } from 'prop-types';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

export default class GameBrowser extends Component {
  static propTypes = {
    buttonStyle: object,
    openGames: array,
    usernameMap: object,
    onJoinGame: func
  };

  renderTableRows() {
    if (this.props.openGames.length > 0) {
      return (
        this.props.openGames.map(game =>
          <TableRow key={game.id}>
            <TableRowColumn>{game.name}</TableRowColumn>
            <TableRowColumn>{this.props.usernameMap[game.id]}</TableRowColumn>
            <TableRowColumn style={{textAlign: 'right'}}>
              <RaisedButton
                secondary
                label="Join Game"
                onTouchTap={() => { this.props.onJoinGame(game.id, game.name); }} />
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
              <TableHeaderColumn>Host Name</TableHeaderColumn>
              <TableHeaderColumn>Join Game</TableHeaderColumn>
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
