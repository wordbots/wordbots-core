import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import * as fb from 'firebase';
import Paper from '@material-ui/core/Paper';
import * as React from 'react';

import * as m from '../../../server/multiplayer/multiplayer';
import * as w from '../../types';
import { GameFormat } from '../../util/formats';

import GameRow from './GameRow';

export interface DisplayedGame {
  id: string
  name: string
  format: w.Format
  players: m.ClientID[]
  options: w.GameOptions
  spectators?: m.ClientID[]
}

interface GameBrowserProps {
  openGames: m.GameWaitingForPlayers[]
  inProgressGames: m.Game[]
  user: fb.User | null
  clientId: m.ClientID | null
  userDataByClientId: Record<m.ClientID, m.UserData>
  availableDecks: w.DeckInGame[]
  onHostGame: () => void
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
      <Paper style={{ marginBottom: 20 }}>
        <Table>
          <TableHead>
            <TableRow style={{ height: 46 }}>
              <TableCell>Game Name</TableCell>
              <TableCell>Format</TableCell>
              <TableCell>Players</TableCell>
              <TableCell>Spectators</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {this.renderTableRows()}
          </TableBody>
        </Table>
      </Paper>
    );
  }

  private renderTableRows(): React.ReactNode {
    const {
      user, clientId, userDataByClientId, availableDecks,
      onHostGame, onCancelHostGame, onJoinGame, onSpectateGame
    } = this.props;

    if (this.games.length > 0) {
      return (
        this.games.map((game, idx) => (
          <GameRow
            idx={idx}
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
          <TableCell
            colSpan={4}
            style={{
              fontSize: 18,
              fontStyle: 'italic',
              fontWeight: 300,
              textAlign: 'center',
              padding: 10
            }}
          >
            No open games. <a className="underline" onClick={onHostGame}>Host a game!</a>
          </TableCell>
        </TableRow>
      );
    }
  }
}
