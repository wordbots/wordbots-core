import { Button, Dialog, DialogActions, DialogContent } from '@material-ui/core';
import * as React from 'react';

import { BACKGROUND_Z_INDEX, BLUE_PLAYER_COLOR, MAX_Z_INDEX, ORANGE_PLAYER_COLOR } from '../../constants';
import * as w from '../../types';
import { opponent } from '../../util/game';

import DraftCardPicker from './DraftCardPicker';
import DraftDeck from './DraftDeck';
import ForfeitButton from './ForfeitButton';
import LeftControls from './LeftControls';
import PlayerName from './PlayerName';

interface DraftAreaProps {
  player: w.PlayerColor | 'neither'
  usernames: w.PerPlayer<string>
  draft: w.DraftState
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
      player, draft, isGameOver, volume,
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
            isTimerEnabled={!isGameOver}
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
            <DraftDeck cards={draft[player as 'blue' | 'orange'].cardsDrafted} />
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
      </div>
    );
  }

  private renderDraftArea(): JSX.Element {
    const { player, onDraftCards } = this.props;

    if (player === 'neither') {
      return (
        <div style={{
            fontFamily: 'Carter One',
            color: 'white',
            textAlign: 'center',
            fontSize: '2em'
          }}>
            Waiting for players<br />to draft cards ...
        </div>
      );
    } else if (this.currentCardGroup) {
      return <DraftCardPicker cardGroup={this.currentCardGroup} player={player} onDraftCards={onDraftCards} />;
    } else {
      return (
        <div style={{
          fontFamily: 'Carter One',
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
    const { draft, usernames } = this.props;

    const numCardsDrafted = draft[color].cardsDrafted.length;

    return (
      <React.Fragment>
        <PlayerName
          opponent={isOpponent}
          color={color}
          playerName={usernames[color]}
        />

        <div style={{
          color: ({orange: ORANGE_PLAYER_COLOR, blue: BLUE_PLAYER_COLOR})[color],
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
      </React.Fragment>
    );
  }

  private handleToggleShowDeck = () => {
    this.setState(({ isDeckOpen }) => ({ isDeckOpen: !isDeckOpen }));
  }
}
