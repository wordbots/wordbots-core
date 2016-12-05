import React, { Component, PropTypes } from 'react';
import Board from '../components/game/Board';
import Chat from '../components/game/Chat';
import Hand from '../components/game/Hand';
import Paper from 'material-ui/lib/paper';
import Divider from 'material-ui/lib/divider';
import Helmet from 'react-helmet';

const TEST_CARDS = [{
  name: 'Tank Bot',
  cost: 3,
  type: 0,
  health: 4,
  speed: 1,
  attack: 2,
  abilities: []
}, {
  name: 'Attack Bot',
  cost: 1,
  type: 0,
  health: 1,
  speed: 2,
  attack: 1,
  abilities: []
}];

class Game extends Component {
  constructor(props) {
    super(props);

    this.state = {
      yourCards: TEST_CARDS,
      opponentsCards: TEST_CARDS
    }
  }

  render() {
    return (
      <div style={{paddingLeft: 256, paddingRight: 256, paddingTop: 64, margin: '48px 72px'}}>
        <Helmet title="Game"/>
        <Paper style={{padding: 20}}>
          <Hand cards={this.state.opponentsCards} opponent/>
          <Divider style={{marginTop: 10}}/>
          <Board />
          <Divider style={{marginBottom: 10}}/>
          <Hand cards={this.state.yourCards}/>
        </Paper>
        <Chat />
      </div>
    );
  }
}

export default Game;
