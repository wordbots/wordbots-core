import * as React from 'react';

import MustBeLoggedIn from '../users/MustBeLoggedIn';

import GameMode from './GameMode';

interface MultiplayerModeSelectionProps {
  disabled?: boolean
  isGuest: boolean
  onSelectMode: (modeStr: string) => void
}

export default class MultiplayerModeSelection extends React.Component<MultiplayerModeSelectionProps> {
  public render(): JSX.Element {
    const { disabled, isGuest } = this.props;
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
      >
        <GameMode
          compact
          name="Singleplayer"
          disabled={disabled}
          onSelect={this.handleClickSingleplayer}
          modesPerRow={3}
        />
        <GameMode
          compact
          name="Host Game"
          disabled={disabled}
          onSelect={this.handleClickCreateCasual}
          modesPerRow={3}
        />
        <GameMode
          compact
          name="Matchmaking"
          disabled={disabled || isGuest}
          onSelect={this.handleClickMatchmaking}
          modesPerRow={3}
          wrapper={this.wrapInMustBeLoggedIn}
        />
      </div>
    );
  }

  private wrapInMustBeLoggedIn = (elt: JSX.Element): JSX.Element => (
    <MustBeLoggedIn loggedIn={!this.props.isGuest}>{elt}</MustBeLoggedIn>
  );

  private handleClickSingleplayer = () => {
    this.props.onSelectMode('singleplayer');
  }

  private handleClickCreateCasual = () => {
    this.props.onSelectMode('host');
  }

  private handleClickMatchmaking = () => {
    this.props.onSelectMode('matchmaking');
  }
}
