import * as React from 'react';

import GameMode from './GameMode';

interface SinglePlayerModeSelectionProps {
  onSelectMode: (modeStr: string) => void
}

export default class SinglePlayerModeSelection extends React.Component<SinglePlayerModeSelectionProps> {
  public render(): JSX.Element {
    return (
      <div>
        <GameMode
          name="Tutorial"
          imagePath="/static/tutorial-new.png"
          explanation="Follow the interactive tutorial to learn how to play Wordbots."
          onSelect={this.handleClickTutorial}
        />
        <GameMode
          name="Practice"
          imagePath="/static/practice-new.png"
          explanation="Pick a deck and play a practice game against the computer."
          onSelect={this.handleClickPractice}
        />
        <GameMode
          name="Sandbox"
          imagePath="/static/sandbox-new.png"
          explanation="Try out any card while controlling both players in sandbox mode."
          onSelect={this.handleClickSandbox}
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
