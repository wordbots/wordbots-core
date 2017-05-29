import React, { Component } from 'react';
import { func } from 'prop-types';

import GameMode from './GameMode';

export default class ModeSelection extends Component {
  static propTypes = {
    onSelectMode: func
  };

  constructor(props) {
    super(props);
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
          onSelect={() => this.props.onSelectMode(0)} />
        <GameMode
          name="Casual Game"
          imagePath="/static/casual.png"
          onSelect={() => this.props.onSelectMode(1)} />
        <GameMode
          disabled
          name="Ranked Matchmaking"
          onSelect={() => this.props.onSelectMode(2)} />
        <GameMode
          disabled
          name="Unranked Matchmaking"
          onSelect={() => this.props.onSelectMode(3)} />
      </div>
    );
  }
}
