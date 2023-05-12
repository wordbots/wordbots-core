import { Button, Dialog, DialogActions, DialogContent } from '@material-ui/core';
import * as React from 'react';

import { BACKGROUND_Z_INDEX, BLUE_PLAYER_COLOR, MAX_Z_INDEX, ORANGE_PLAYER_COLOR } from '../../constants';
import * as w from '../../types';
import { GameFormat } from '../../util/formats';
import { opponent } from '../../util/game';
import EnergyCurve from '../cards/EnergyCurve';

import DraftCardPicker from './DraftCardPicker';
import DraftDeck from './DraftDeck';
import ForfeitButton from './ForfeitButton';
import LeftControls from './LeftControls';
import PlayerName from './PlayerName';

interface DraftAreaProps {
  player: w.PlayerColor | 'neither'
  usernames: w.PerPlayer<string>
  disconnectedPlayers: w.PlayerColor[]
  draft: w.DraftState
  format: GameFormat
  gameOptions: w.GameOptions
  isGameOver: boolean
  volume: number
  onForfeit: (winner: w.PlayerColor) => void
  onDraftCards: (player: w.PlayerColor, cards: w.CardInGame[]) => void
  onSetVolume: (volume: number) => void
  onToggleFullscreen: () => void
}

interface DraftAreaState {
  isDeckOpen: boolean
}

export default class DraftArea extends React.Component<DraftAreaProps, DraftAreaState> {
  public state = {
    isDeckOpen: false
  };

  get currentCardGroup(): w.CardInGame[] | null {
    const { draft, player } = this.props;
    if (player !== 'neither') {
      return draft[player].cardGroupsToShow[0] || null;
    } else {
      return null;
    }
  }

  public render(): JSX.Element {
    const {
      player, draft, gameOptions, isGameOver, volume,
      onForfeit, onSetVolume, onToggleFullscreen
    } = this.props;
    const { isDeckOpen } = this.state;

    return (
      <div
        className="background"
        style={{
          display: 'flex',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ width: 200 }}>
          {this.renderPlayerArea(player === 'neither' ? 'blue' : opponent(player), true)}
          <LeftControls
            player={player}
            currentTurn="draft"
            draft={draft}
            isTimerEnabled={!gameOptions.disableTurnTimer && !isGameOver}
            volume={volume}
            style={{ marginLeft: 200 }}
            onPassTurn={onForfeit}
            onSetVolume={onSetVolume}
            onToggleFullscreen={onToggleFullscreen}
          />
          {this.renderPlayerArea(player === 'neither' ? 'orange' : player, false)}
        </div>

        <div style={{ width: 500 }}>
          {this.renderDraftArea()}
        </div>

        <div
          className="background"
          style={{
            marginRight: 20,
            maxWidth: 220,
            textAlign: 'right',
            zIndex: BACKGROUND_Z_INDEX
          }}
        >
          <ForfeitButton
            text="abort"
            width={150}
            player={player === 'neither' ? null : player}
            isSpectator={player === 'neither'}
            gameOver={isGameOver}
            onForfeit={onForfeit}
          />
        </div>

        {player !== 'neither' && (
          <Dialog
            open={isDeckOpen && !isGameOver}
            PaperProps={{
              style: {
                width: 1010,
                maxWidth: 1010,
                overflow: 'none'
              }
            }}
            style={{ zIndex: MAX_Z_INDEX }}
            onClose={this.handleToggleShowDeck}
          >
            <DialogContent>
              <DraftDeck cards={draft[player].cardsDrafted} />
            </DialogContent>
            <DialogActions>
              <Button
                key="Close"
                color="primary"
                onClick={this.handleToggleShowDeck}
              >
                Close
            </Button>
            </DialogActions>
          </Dialog>
        )}
      </div>
    );
  }

  private renderDraftArea(): JSX.Element {
    const { player, format } = this.props;

    if (player === 'neither') {
      return (
        <div style={{
          fontFamily: '"Carter One", "Carter One-fallback"',
          color: 'white',
          textAlign: 'center',
          fontSize: '2em'
        }}>
          Waiting for players<br />to draft cards ...
        </div>
      );
    } else if (this.currentCardGroup) {
      return (
        <DraftCardPicker
          cardGroup={this.currentCardGroup}
          player={player}
          format={format}
          onDraftCards={this.handleDraftCards}
        />
      );
    } else {
      return (
        <div style={{
          fontFamily: '"Carter One", "Carter One-fallback"',
          color: 'white',
          textAlign: 'center',
          fontSize: '2em'
        }}>
          You&rsquo;re done!<br />Waiting for opponent ...
        </div>
      );
    }
  }

  private renderPlayerArea(color: w.PlayerColor, isOpponent: boolean): React.ReactNode {
    const { draft, player, usernames, disconnectedPlayers } = this.props;
    const { cardsDrafted } = draft[color];

    const numCardsDrafted = cardsDrafted.length;
    const playerColor = ({ orange: ORANGE_PLAYER_COLOR, blue: BLUE_PLAYER_COLOR })[color];

    return (
      <React.Fragment>
        <PlayerName
          opponent={isOpponent}
          color={color}
          playerName={usernames[color]}
          isDisconnected={disconnectedPlayers.includes(color)}
        />

        <div style={{
          color: playerColor,
          margin: 10,
          paddingLeft: 40,
          fontSize: '1.5em',
          fontFamily: 'VT323',
        }}>
          {
            !isOpponent && numCardsDrafted > 0
              ? <a className="underline" onClick={this.handleToggleShowDeck}>
                {numCardsDrafted}/30 cards
                </a>
              : <span>{numCardsDrafted}/30 cards</span>
          }
        </div>

        {(!isOpponent || player === 'neither') && <EnergyCurve cards={cardsDrafted} height={100} textColor="white" chartColor={playerColor} />}
      </React.Fragment>
    );
  }

  private handleDraftCards = (player: w.PlayerColor, cards: w.CardInGame[]) => {
    const { disconnectedPlayers, onDraftCards } = this.props;
    if (disconnectedPlayers.length === 0) {
      onDraftCards(player, cards);
    }
  }

  private handleToggleShowDeck = () => {
    this.setState(({ isDeckOpen }) => ({ isDeckOpen: !isDeckOpen }));
  }
}
