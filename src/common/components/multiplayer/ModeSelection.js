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
          onSelect={() => this.props.onSelectMode(0)} 
          disabled />
        <GameMode 
          name="Custom Game" 
          onSelect={() => this.props.onSelectMode(1)} />
        <GameMode 
          name="Ranked Matchmaking" 
          onSelect={() => this.props.onSelectMode(2)} 
          disabled/>
        <GameMode 
          name="Unranked Matchmaking" 
          onSelect={() => this.props.onSelectMode(3)} 
          disabled/>
      </div>
    );
  }
}
