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

  handleClickMatchmaking = () => {
    this.props.onSelectMode('matchmaking');
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
          onSelect={this.handleClickCreateCasual} />
        <GameMode
          name="Matchmaking"
          imagePath="/static/casual.png"
          onSelect={this.handleClickMatchmaking} />
      </div>
    );
  }
}
