import Button from '@material-ui/core/Button';
import * as fb from 'firebase';
import FontIcon from 'material-ui/FontIcon';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import * as React from 'react';

import * as m from '../../../server/multiplayer/multiplayer';
import * as w from '../../types';
import { GameFormat } from '../../util/formats';
import { guestUID } from '../../util/multiplayer';

import { DisplayedGame } from './GameBrowser';

interface GameRowProps {
  game: DisplayedGame
  user: fb.User | null
  clientId: m.ClientID
  userDataByClientId: Record<m.ClientID, m.UserData>
  availableDecks: w.Deck[]
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
    const { game } = this.props;
    return (
      <TableRow key={game.id} selected={this.isMyGame}>
        <TableRowColumn>{game.name}</TableRowColumn>
        <TableRowColumn>{GameFormat.decode(game.format).rendered()}</TableRowColumn>
        <TableRowColumn>{game.players.map(this.renderPlayerName).join(', ')}</TableRowColumn>
        <TableRowColumn>{(game.spectators || []).map(this.renderPlayerName).join(', ')}</TableRowColumn>
        <TableRowColumn style={{textAlign: 'right'}} {...{title: this.buttonTooltip}}>
          {this.renderButtons()}
        </TableRowColumn>
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
            color="secondary"
            onClick={this.handleJoinGame}
            disabled={!this.anyValidDecks}
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
          </Button>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            onClick={this.handleSpectateGame}
          >
            Spectate Game
          </Button>
        );
    } else {
      return (
        <Button
          variant="outlined"
          color="secondary"
          onClick={this.props.onCancelHostGame}
        >
          Cancel Game
        </Button>
      );
    }
  }
}
