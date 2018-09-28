import * as React from 'react';
import { func } from 'prop-types';

import GameMode from '../GameMode';

export default class SinglePlayerModeSelection extends React.Component {
  static propTypes = {
    onSelectMode: func
  };

  handleClickTutorial = () => {
    this.props.onSelectMode('tutorial');
  }

  handleClickPractice = () => {
    this.props.onSelectMode('practice');
  }

  handleClickSandbox = () => {
    this.props.onSelectMode('sandbox');
  }

  render() {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
      }}>
        <GameMode
          name="Tutorial"
          imagePath="/static/tutorial.png"
          onSelect={this.handleClickTutorial} />
        <GameMode
          name="Practice"
          imagePath="/static/practice.png"
          onSelect={this.handleClickPractice} />
        <GameMode
          name="Sandbox"
          imagePath="/static/practice.png"
          onSelect={this.handleClickSandbox} />
        <GameMode
          name="Puzzle (Coming Soon)"
          disabled />
      </div>
    );
  }
}
