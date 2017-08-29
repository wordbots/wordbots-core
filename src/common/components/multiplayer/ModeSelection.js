import React, {Component} from 'react';
import {func} from 'prop-types';

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
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'row'
        }}
      >
        <GameMode
          name="Tutorial"
          imagePath="/static/tutorial.png"
          onSelect={() => this.props.onSelectMode('tutorial')}
        />
        <GameMode
          name="Practice"
          imagePath="/static/practice.png"
          onSelect={() => this.props.onSelectMode('practice')}
        />
        <GameMode
          name="Casual Game"
          imagePath="/static/casual.png"
          onSelect={() => this.props.onSelectMode('casual')}
        />
        <GameMode
          disabled
          name="Matchmaking"
          onSelect={() => this.props.onSelectMode('matchmaking')}
        />
      </div>
    );
  }
}
