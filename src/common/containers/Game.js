import React, { Component, PropTypes } from 'react';
import HexGrid from '../components/game/HexGrid';
import Chat from '../components/game/Chat';
import Paper from 'material-ui/lib/paper';
import Helmet from 'react-helmet';

class Game extends Component {
  render() {
    return (
      <div style={{paddingLeft: 256, paddingRight: 256, paddingTop: 0, margin: '48px 72px'}}>
        <Helmet title="Game"/>
        <Paper style={{padding: 20}}>
          <HexGrid />
        </Paper>
        <Chat />
      </div>
    );
  }
}

export default Game;
