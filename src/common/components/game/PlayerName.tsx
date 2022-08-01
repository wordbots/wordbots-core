import * as React from 'react';

import { BLUE_PLAYER_COLOR, ORANGE_PLAYER_COLOR, SIDEBAR_COLLAPSED_WIDTH } from '../../constants';
import * as w from '../../types';

interface PlayerNameProps {
  color: w.PlayerColor
  playerName: string
  opponent?: boolean
  isSandbox?: boolean
}

export default class PlayerName extends React.PureComponent<PlayerNameProps> {
  public render(): JSX.Element {
    const { color, playerName, opponent, isSandbox } = this.props;
    return (
      <div
        style={{
          position: 'absolute',
          backgroundColor: {orange: ORANGE_PLAYER_COLOR, blue: BLUE_PLAYER_COLOR}[color],
          color: 'white',
          fontFamily: '"Carter One", "Carter One-fallback"',
          fontSize: 32,
          left: isSandbox ? (SIDEBAR_COLLAPSED_WIDTH + 5) : 0,
          top: opponent ? 0 : 'auto',
          bottom: opponent ? 'auto' : 0,
          padding: '8px 10px',
          borderBottomRightRadius: opponent ? 5 : 0,
          borderTopRightRadius: opponent ? 0 : 5,
          boxShadow: opponent ?
            '2px 2px 5px 1px rgba(0, 0, 0, 0.23)' :
            '2px -2px 5px 1px rgba(0, 0, 0, 0.23)'
        }}
      >
        {playerName}
      </div>
    );
  }
}
