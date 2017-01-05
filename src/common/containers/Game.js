import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import Board from '../components/game/Board';
import Chat from '../components/game/Chat';
import Hand from '../components/game/Hand';
import ManaCount from '../components/game/ManaCount';

import Paper from 'material-ui/lib/paper';
import Divider from 'material-ui/lib/divider';
import RaisedButton from 'material-ui/lib/raised-button';

import { connect } from 'react-redux';
import * as gameActions from '../actions/game';

function mapStateToProps(state) {
  return {
    selectedCard: state.game.players.green.selectedCard,
    selectedTile: state.game.selectedTile,
    yourHand: state.game.players.green.hand,
    opponentsHand: state.game.players.red.hand,
    yourPieces: state.game.players.green.robotsOnBoard,
    opponentsPieces: state.game.players.red.robotsOnBoard,
    yourTurn: state.game.currentTurn === 'green',
    redMana: state.game.players.red.mana,
    greenMana: state.game.players.green.mana,
    yourDeck: state.game.players.green.deck,
    opponentsDeck: state.game.players.red.deck
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onPassTurn: () => {
      dispatch(gameActions.passTurn());
    },
    onSelectCard: (index) => {
      dispatch(gameActions.setSelectedCard(index));
    },
    onSelectTile: (hexId) => {
      dispatch(gameActions.setSelectedTile(hexId));
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
          <Hand
            cards={this.props.opponentsHand}
            isCurrentPlayer={!this.props.yourTurn} />
          <ManaCount mana={this.props.redMana}/>
          <Divider style={{marginTop: 10}}/>
          <Board
            onSelectTile={(hexId) => {
              this.props.onSelectTile(hexId);
            }}
            selectedTile={this.props.selectedTile}
            yourPieces={this.props.yourPieces}
            opponentsPieces={this.props.opponentsPieces}
            yourTurn={this.props.yourTurn} />
          <RaisedButton
            label="Pass Turn"
            onTouchTap={(index) => {
              this.props.onPassTurn();
            }} />
          <Divider style={{marginBottom: 10}}/>
          <Hand
            onSelectCard={(index) => {
              this.props.onSelectCard(index);
            }}
            selectedCard={this.props.selectedCard}
            isCurrentPlayer={this.props.yourTurn}
            cards={this.props.yourHand} />
          <ManaCount mana={this.props.greenMana}/>
        </Paper>
        <Chat />
      </div>
    );
  }
}

Game.propTypes = {
  selectedCard: React.PropTypes.number,
  onSelectCard: React.PropTypes.func,
  onSelectTile: React.PropTypes.func,
  onPassTurn: React.PropTypes.func,
  opponentsHand: React.PropTypes.array,
  yourHand: React.PropTypes.array,
  yourPieces: React.PropTypes.object,
  opponentsPieces: React.PropTypes.object,
  yourTurn: React.PropTypes.bool,
  selectedTile: React.PropTypes.string,
  redMana: React.PropTypes.object,
  greenMana: React.PropTypes.object
}

export default connect(mapStateToProps, mapDispatchToProps)(Game);
