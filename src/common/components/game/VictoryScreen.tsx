import * as React from 'react';

import { BLUE_PLAYER_COLOR, MAX_Z_INDEX, ORANGE_PLAYER_COLOR } from '../../constants';
import * as w from '../../types';

interface VictoryScreenProps {
  winner: w.GameWinner  // 'blue', 'orange', 'draw' or null (null indicates game still in progress)
  winnerName: string | null,
  onClick: () => void
}

export default class VictoryScreen extends React.Component<VictoryScreenProps> {
  public render(): JSX.Element {
    const { winner, winnerName, onClick } = this.props;
    const colors = {
      'orange': ORANGE_PLAYER_COLOR,
      'blue': BLUE_PLAYER_COLOR
    };

    return (
      <div
        onClick={onClick}
        style={{
          display: winner === null ? 'none' : 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          textAlign: 'center',
          left: 0,
          top: 0,
          bottom: 0,
          right: 0,
          fontFamily: 'Carter One',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          color: (winner && winner !== 'draw') ? colors[winner] : 'white',
          borderRadius: 2,
          zIndex: MAX_Z_INDEX
        }}
      >
        <div>
          <div style={{fontSize: 96}}>
            {winnerName ? `${winnerName} ${winnerName === 'You' ? 'win' : 'wins'}!` : (winner === 'draw' ? 'Draw game!' : '')}
          </div>
          <div>Click anywhere to leave the game.</div>
        </div>
      </div>
    );
  }
}
