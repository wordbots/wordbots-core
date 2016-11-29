import React, { Component, PropTypes } from 'react';
import HexGrid from '../components/game/HexGrid';
import Helmet from 'react-helmet';

class Game extends Component {
  render() {
    return (
      <div>
        <Helmet title="Game"/>
        <HexGrid />
      </div>
    );
  }
}

export default Game;
