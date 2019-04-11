import * as React from 'react';

import GameMode from '../GameMode';

interface SinglePlayerModeSelectionProps {
  onSelectMode: (modeStr: string) => void
}

export default class SinglePlayerModeSelection extends React.Component<SinglePlayerModeSelectionProps> {
  public render(): JSX.Element {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }}
      >
        <GameMode
          name="Tutorial"
          imagePath="/static/tutorial.png"
          onSelect={this.handleClickTutorial}
        />
        <GameMode
          name="Practice"
          imagePath="/static/practice.png"
          onSelect={this.handleClickPractice}
        />
        <GameMode
          name="Sandbox"
          imagePath="/static/practice.png"
          onSelect={this.handleClickSandbox}
        />
        <GameMode
          name="Puzzle (Coming Soon)"
          disabled
        />
      </div>
    );
  }

  private handleClickTutorial = () => {
    this.props.onSelectMode('tutorial');
  }

  private handleClickPractice = () => {
    this.props.onSelectMode('practice');
  }

  private handleClickSandbox = () => {
    this.props.onSelectMode('sandbox');
  }
}
