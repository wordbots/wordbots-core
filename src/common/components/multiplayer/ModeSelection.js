import React, { Component } from 'react';
import { func } from 'prop-types';

import GameMode from './GameMode';

export default class ModeSelection extends Component {
  static propTypes = {
    onSelectMode: func
  };

  handleClickTutorial = () => {
    this.props.onSelectMode('tutorial');
  }

  handleClickPractice = () => {
    this.props.onSelectMode('practice');
  }

  handleClickCasual = () => {
    this.props.onSelectMode('casual');
  }

  handleClickMatchmaking = () => {
    this.props.onSelectMode('ranked');
  }

  render() {
    return (
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row'
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
          name="Casual Game"
          imagePath="/static/casual.png"
          onSelect={this.handleClickCasual} />
        <GameMode
          name="Ranked Matchmaking"
          onSelect={this.handleClickMatchmaking} />
      </div>
    );
  }
}
