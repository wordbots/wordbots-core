import * as React from 'react';

import { BLUE_PLAYER_COLOR, MAX_Z_INDEX, ORANGE_PLAYER_COLOR } from '../../constants';
import * as w from '../../types';

interface VictoryScreenProps {
  winner: w.GameWinner  // 'blue', 'orange', 'draw', 'aborted' or null (null indicates game still in progress)
  winnerName: string | null
  onClick: () => void
}

export default class VictoryScreen extends React.PureComponent<VictoryScreenProps> {
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
          fontFamily: '"Carter One", "Carter One-fallback"',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          color: (winner && winner !== 'draw' && winner !== 'aborted') ? colors[winner] : 'white',
          borderRadius: 2,
          zIndex: MAX_Z_INDEX
        }}
      >
        <div>
          <div style={{fontSize: 96}}>
            {winnerName
              ? `${winnerName} ${winnerName === 'You' ? 'win' : 'wins'}!`
              : (winner === 'draw' ? 'Draw game!' : (winner === 'aborted' ? 'Game aborted' : ''))}
          </div>
          <div>Click anywhere to leave the game.</div>
        </div>
      </div>
    );
  }
}
