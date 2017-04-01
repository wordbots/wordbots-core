import React, { Component } from 'react';
import Paper from 'material-ui/lib/paper';
import RaisedButton from 'material-ui/lib/raised-button';
import Table from 'material-ui/lib/table/table';
import TableBody from 'material-ui/lib/table/table-body';
import TableHeader from 'material-ui/lib/table/table-header';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableRowColumn from 'material-ui/lib/table/table-row-column';

export class GameBrowser extends Component {
  constructor(props) {
    super(props);
  }

  renderTableRows() {
    if (this.props.openGames.length > 0) {
      return (
        this.props.openGames.map(game =>
          <TableRow key={game.id}>
            <TableRowColumn>{game.name}</TableRowColumn>
            <TableRowColumn>{this.props.clientIdToUsername[game.id]}</TableRowColumn>
            <TableRowColumn style={{textAlign: 'right'}}>
              <RaisedButton
                secondary
                label="Join Game"
                onTouchTap={e => {
                  this.props.onJoinGame(game.id, game.name);
                }} />
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
        <Table fixedHeader={true}>
          <TableHeader displaySelectAll={false}>
            <TableRow>
              <TableHeaderColumn>Game Name</TableHeaderColumn>
              <TableHeaderColumn>Host Name</TableHeaderColumn>
              <TableHeaderColumn>Join Game</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            showRowHover={true}
            stripedRows={false}
            displayRowCheckbox={false}>
            {this.renderTableRows()}
          </TableBody>
        </Table>        
      </Paper>
    );
  }
}

const { array, func, object } = React.PropTypes;

GameBrowser.propTypes = {
  buttonStyle: object,
  openGames: array,
  clientIdToUsername: object,
  onJoinGame: func
};

export default GameBrowser;
