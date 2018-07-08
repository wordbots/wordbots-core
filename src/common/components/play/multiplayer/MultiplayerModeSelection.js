import * as React from 'react';
import { func } from 'prop-types';

import GameMode from '../GameMode';

export default class MultiplayerModeSelection extends React.Component {
  static propTypes = {
    onSelectMode: func
  };

  handleClickCreateCasual = () => {
    this.props.onSelectMode('host');
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
          onSelect={this.handleClickCreateCasual} />
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
