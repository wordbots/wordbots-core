import * as React from 'react';

import { BACKGROUND_Z_INDEX, BLUE_PLAYER_COLOR, ORANGE_PLAYER_COLOR } from '../../constants';
import * as w from '../../types';
import { opponent } from '../../util/game';

import DraftCardPicker from './DraftCardPicker';
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

export default class DraftArea extends React.Component<DraftAreaProps> {
  get numCardsYouHaveDrafted(): number | undefined {
    const { draft, player } = this.props;
    if (player !== 'neither') {
      return draft[player].cardsDrafted.length;
    }
  }

  get numCardsOpponentHasDrafted(): number | undefined {
    const { draft, player } = this.props;
    if (player !== 'neither') {
      return draft[opponent(player)].cardsDrafted.length;
    }
  }

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
          {numCardsDrafted}/30 cards
        </div>
      </React.Fragment>
    );
  }
}
