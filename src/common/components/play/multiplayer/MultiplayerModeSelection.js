import * as React from 'react';
import { func } from 'prop-types';
import { noop } from 'lodash';

import GameMode from '../GameMode';

export default class MultiplayerModeSelection extends React.Component {
  static propTypes = {
    onSelectMode: func
  };

  handleClickCreateCasual = () => {
    // TO-DO: make this button pop-up the casual game creation modal
    noop();
  }

  handleClickUnrankedMatchmaking = () => {
    this.props.onSelectMode('unranked');
  }

  handleClickRankedMatchmaking = () => {
    this.props.onSelectMode('ranked');
  }

  render() {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
      }}>
        <GameMode
          name="Create Casual Game"
          imagePath="/static/casual.png"
          modesPerRow={3}
          onSelect={noop} />
        <GameMode
          disabled
          name="Unranked Matchmaking"
          modesPerRow={3}
          onSelect={this.handleClickUnrankedMatchmaking} />
        <GameMode
          name="Ranked Matchmaking"
          imagePath="/static/casual.png"
          modesPerRow={3}
          onSelect={this.handleClickRankedMatchmaking} />
      </div>
    );
  }
}
