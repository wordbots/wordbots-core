import * as React from 'react';
import { bool, func } from 'prop-types';

import GameMode from '../GameMode';

export default class MultiplayerModeSelection extends React.Component {
  static propTypes = {
    disabled: bool,
    isGuest: bool,
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
    const { disabled, isGuest } = this.props;
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
      }}>
        <GameMode
          compact
          name="Create Casual Game"
          disabled={disabled}
          onSelect={this.handleClickCreateCasual} />
        <GameMode
          compact
          name="Matchmaking"
          disabled={disabled || isGuest}
          onSelect={this.handleClickMatchmaking} />
      </div>
    );
  }
}
