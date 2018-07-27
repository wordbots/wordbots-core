import * as React from 'react';
import { bool, func } from 'prop-types';

import GameMode from '../GameMode';

export default class MultiplayerModeSelection extends React.Component {
  static propTypes = {
    disabled: bool,
    onSelectMode: func
  };

  static defaultProps = {
    disabled: false
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
          disabled={this.props.disabled}
          imagePath="/static/casual.png"
          onSelect={this.handleClickCreateCasual} />
        <GameMode
          name="Matchmaking"
          disabled={this.props.disabled}
          imagePath="/static/casual.png"
          onSelect={this.handleClickMatchmaking} />
      </div>
    );
  }
}
