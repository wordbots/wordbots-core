import React, {Component} from 'react';
import {bool, string} from 'prop-types';

class PlayerName extends Component {
  render() {
    return (
      <div
        style={{
          position: 'absolute',
          backgroundColor: {orange: '#ffb85d', blue: '#badbff'}[this.props.color],
          color: 'white',
          fontFamily: 'Carter One',
          fontSize: 32,
          left: 0,
          top: this.props.opponent ? 0 : 'auto',
          bottom: this.props.opponent ? 'auto' : 0,
          padding: '8px 10px',
          borderBottomRightRadius: this.props.opponent ? 5 : 0,
          borderTopRightRadius: this.props.opponent ? 0 : 5,
          boxShadow: this.props.opponent
            ? '2px 2px 5px 1px rgba(0, 0, 0, 0.23)'
            : '2px -2px 5px 1px rgba(0, 0, 0, 0.23)'
        }}
      >
        {this.props.playerName}
      </div>
    );
  }
}

PlayerName.propTypes = {
  opponent: bool,
  color: string,
  playerName: string
};

export default PlayerName;
