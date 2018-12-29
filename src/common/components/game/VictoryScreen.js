import * as React from 'react';
import { func, string } from 'prop-types';

import { MAX_Z_INDEX } from '../../constants.ts';

const VictoryScreen = ({ winnerColor, winnerName, onClick }) => {
  const colors = {
    'orange': '#ffb85d',
    'blue': '#badbff'
  };

  return (
    <div
      onClick={onClick}
      style={{
        display: winnerColor === null ? 'none' : 'flex',
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
        color: colors[winnerColor],
        borderRadius: 2,
        zIndex: MAX_Z_INDEX
    }}>
      <div>
        <div style={{fontSize: 96}}>
          {`${winnerName} ${winnerName === 'You' ? 'win' : 'wins'}!`}
        </div>
        <div>Click anywhere to leave the game.</div>
      </div>
    </div>
  );
};

VictoryScreen.propTypes = {
  winnerColor: string,
  winnerName: string,
  onClick: func
};

export default VictoryScreen;
