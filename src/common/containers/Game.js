import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import Board from '../components/game/Board';
import Chat from '../components/game/Chat';
import Hand from '../components/game/Hand';
import Paper from 'material-ui/lib/paper';
import Divider from 'material-ui/lib/divider';

import { connect } from 'react-redux';
import * as gameActions from '../actions/game';

function mapStateToProps(state) {
  return {
    selectedCard: state.game.players.green.selectedCard,
    yourHand: state.game.players.green.hand,
    opponentsHand: state.game.players.red.hand,
    yourPieces: state.game.players.green.robotsOnBoard,
    opponentsPieces: state.game.players.red.robotsOnBoard,
    yourTurn: state.game.currentTurn === 'green'
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onSelect: (index) => {
      dispatch(gameActions.setSelectedCard(index))
    }
  }
}

class Game extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{paddingLeft: 256, paddingRight: 256, paddingTop: 64, margin: '48px 72px'}}>
        <Helmet title="Game"/>
        <Paper style={{padding: 20}}>
          <Hand cards={this.props.opponentsHand} opponent/>
          <Divider style={{marginTop: 10}}/>
          <Board 
            yourPieces={this.props.yourPieces} 
            opponentsPieces={this.props.opponentsPieces}
            yourTurn={this.props.yourTurn} />
          <Divider style={{marginBottom: 10}}/>
          <Hand 
            onSelect={(index) => {
              this.props.onSelect(index);
            }}
            selectedCard={this.props.selectedCard} 
            cards={this.props.yourHand} />
        </Paper>
        <Chat />
      </div>
    );
  }
}

Game.propTypes = {
  selectedCard: React.PropTypes.number,
  onSelect: React.PropTypes.func,
  opponentsHand: React.PropTypes.array,
  yourHand: React.PropTypes.array,
  yourPieces: React.PropTypes.object,
  opponentsPieces: React.PropTypes.object,
  yourTurn: React.PropTypes.bool
}

export default connect(mapStateToProps, mapDispatchToProps)(Game);
