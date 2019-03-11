import * as React from 'react';
import { bool, string } from 'prop-types';

import { ORANGE_PLAYER_COLOR, BLUE_PLAYER_COLOR } from '../../constants.ts';

const PlayerName = ({ color, opponent, playerName }) => (
  <div style={{
    position: 'absolute',
    backgroundColor: {orange: ORANGE_PLAYER_COLOR, blue: BLUE_PLAYER_COLOR}[color],
    color: 'white',
    fontFamily: 'Carter One',
    fontSize: 32,
    left: 0,
    top: opponent ? 0 : 'auto',
    bottom: opponent ? 'auto' : 0,
    padding: '8px 10px',
    borderBottomRightRadius: opponent ? 5 : 0,
    borderTopRightRadius: opponent ? 0 : 5,
    boxShadow: opponent ?
      '2px 2px 5px 1px rgba(0, 0, 0, 0.23)' :
      '2px -2px 5px 1px rgba(0, 0, 0, 0.23)'
  }}>
    {playerName}
  </div>
);

PlayerName.propTypes = {
  color: string,
  opponent: bool,
  playerName: string
};

export default PlayerName;
