import * as React from 'react';

import GameMode from '../GameMode';

interface MultiplayerModeSelectionProps {
  disabled?: boolean
  isGuest: boolean
  onSelectMode: (modeStr: string) => void
}

export default class MultiplayerModeSelection extends React.Component<MultiplayerModeSelectionProps> {
  public render(): JSX.Element {
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

  private handleClickCreateCasual = () => {
    this.props.onSelectMode('host');
  }

  private handleClickMatchmaking = () => {
    this.props.onSelectMode('matchmaking');
  }

}
