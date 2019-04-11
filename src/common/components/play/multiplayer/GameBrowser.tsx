import * as fb from 'firebase';
import Paper from 'material-ui/Paper';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import * as React from 'react';

import * as m from '../../../../server/multiplayer/multiplayer';
import * as w from '../../../types';
import { GameFormat } from '../../../util/formats';

import GameRow from './GameRow';

export interface DisplayedGame {
  id: string,
  name: string,
  format: w.Format,
  players: m.ClientID[],
  options: w.GameOptions
  spectators?: m.ClientID[]
}

interface GameBrowserProps {
  openGames: m.GameWaitingForPlayers[]
  inProgressGames: m.Game[]
  user: fb.User | null
  clientId: m.ClientID | null
  userDataByClientId: Record<m.ClientID, m.UserData>
  availableDecks: w.Deck[]
  onCancelHostGame: () => void
  onJoinGame: (id: string, name: string, format: GameFormat, options: w.GameOptions) => void
  onSpectateGame: (id: m.ClientID, name: string) => void
}

export default class GameBrowser extends React.Component<GameBrowserProps> {
  get games(): DisplayedGame[] {
    return [...this.props.openGames, ...this.props.inProgressGames];
  }

  public render(): JSX.Element {
    return (
      <Paper
        style={{ marginBottom: 20 }}
      >
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
            displayRowCheckbox={false}
          >
            {this.renderTableRows()}
          </TableBody>
        </Table>
      </Paper>
    );
  }

  private renderTableRows(): React.ReactNode {
    const { user, clientId, userDataByClientId, availableDecks, onCancelHostGame, onJoinGame, onSpectateGame } = this.props;

    if (this.games.length > 0) {
      return (
        this.games.map((game) => (
          <GameRow
            key={game.id}
            game={game}
            user={user}
            clientId={clientId!}
            userDataByClientId={userDataByClientId}
            availableDecks={availableDecks}
            onCancelHostGame={onCancelHostGame}
            onJoinGame={onJoinGame}
            onSpectateGame={onSpectateGame}
          />
        ))
      );
    } else {
      return (
        <TableRow>
          <TableRowColumn
            colSpan={3}
            style={{
              fontSize: 32,
              fontStyle: 'italic',
              fontWeight: 300,
              textAlign: 'center',
              padding: 24
            }}
          >
            No open games.
          </TableRowColumn>
        </TableRow>
      );
    }
  }
}
