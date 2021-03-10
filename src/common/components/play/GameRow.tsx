import { TableCell, TableRow } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import * as fb from 'firebase';
import * as React from 'react';

import * as m from '../../../server/multiplayer/multiplayer';
import * as w from '../../types';
import { GameFormat } from '../../util/formats';
import { guestUID } from '../../util/multiplayer';

import { DisplayedGame } from './GameBrowser';

interface GameRowProps {
  idx: number
  game: DisplayedGame
  user: fb.User | null
  clientId: m.ClientID
  userDataByClientId: Record<m.ClientID, m.UserData>
  availableDecks: w.DeckInGame[]
  onCancelHostGame: () => void
  onJoinGame: (id: string, name: string, format: GameFormat, options: w.GameOptions) => void
  onSpectateGame: (id: m.ClientID, name: string) => void
}

export default class GameRow extends React.Component<GameRowProps> {
  get myUID(): string {
    const { clientId, user } = this.props;
    if (user) {
      return user.uid;
    } else {
      return guestUID(clientId);
    }
  }

  get isMyGame(): boolean {
    const { game, userDataByClientId } = this.props;
    return game.players.some((clientId) =>
      userDataByClientId[clientId] && userDataByClientId[clientId].uid === this.myUID
    );
  }

  get format(): GameFormat {
    return GameFormat.decode(this.props.game.format);
  }

  get anyValidDecks(): boolean {
    const { availableDecks } = this.props;
    return availableDecks.some(this.format.isDeckValid);
  }

  get buttonTooltip(): string {
    const { game } = this.props;
    if (!this.anyValidDecks) {
      return `None of your decks is valid in the ${this.format.displayName} format.`;
    } else if (game.options.passwordToJoin) {
      return 'This game requires a password to join.';
    }
    return '';
  }

  public render(): JSX.Element {
    const { idx, game } = this.props;
    return (
      <TableRow
        key={game.id}
        selected={this.isMyGame}
        style={{ backgroundColor: idx % 2 === 0 ? '#ddd' : 'white' }}
      >
        <TableCell>{game.name}</TableCell>
        <TableCell>{GameFormat.decode(game.format).rendered()}</TableCell>
        <TableCell>{game.players.map(this.renderPlayerName).join(', ')}</TableCell>
        <TableCell>{(game.spectators || []).map(this.renderPlayerName).join(', ')}</TableCell>
        <TableCell title={this.buttonTooltip} style={{textAlign: 'right'}}>
          {this.renderButtons()}
        </TableCell>
      </TableRow>
    );
  }

  private handleJoinGame = () => {
    const { game: { id, name, options }, onJoinGame } = this.props;

    onJoinGame(id, name, this.format, options);
  }

  private handleSpectateGame = () => {
    const { game, onSpectateGame } = this.props;
    onSpectateGame(game.id, game.name);
  }

  private renderPlayerName = (clientId: m.ClientID) => {
    const { userDataByClientId } = this.props;
    const userData = userDataByClientId[clientId];
    if (userData) {
      return (userData.uid === this.myUID) ? 'Me' : userData.displayName;
    } else {
      return clientId;
    }
  }

  private renderButtons = () => {
    const { game } = this.props;
    if (!this.isMyGame) {
      return (game.players.length === 1) ? (
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleJoinGame}
            disabled={!this.anyValidDecks}
          >
            Join Game
            {game.options.passwordToJoin &&
              <Icon
                className="material-icons"
                style={{ marginLeft: 5, color: 'white' }}
              >
                vpn_key
              </Icon>
            }
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleSpectateGame}
          >
            Spectate Game
          </Button>
        );
    } else {
      return (
        <Button
          variant="outlined"
          color="primary"
          onClick={this.props.onCancelHostGame}
        >
          Cancel Game
        </Button>
      );
    }
  }
}
