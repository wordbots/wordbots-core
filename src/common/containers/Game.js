import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import ReactTooltip from 'react-tooltip';

import Board from '../components/game/Board';
import Chat from '../components/game/Chat';
import Hand from '../components/game/Hand';
import ManaCount from '../components/game/ManaCount';
import Deck from '../components/game/Deck';

import Paper from 'material-ui/lib/paper';
import Divider from 'material-ui/lib/divider';
import RaisedButton from 'material-ui/lib/raised-button';

import { connect } from 'react-redux';
import * as gameActions from '../actions/game';

function mapStateToProps(state) {
  return {
    currentTurn: state.game.currentTurn,
    selectedCard: state.game.players.blue.selectedCard,
    selectedTile: state.game.selectedTile,

    blueHand: state.game.players.blue.hand,
    orangeHand: state.game.players.orange.hand,

    bluePieces: state.game.players.blue.robotsOnBoard,
    orangePieces: state.game.players.orange.robotsOnBoard,

    blueMana: state.game.players.blue.mana,
    orangeMana: state.game.players.orange.mana,

    blueDeck: state.game.players.blue.deck,
    orangeDeck: state.game.players.orange.deck
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onMoveRobot: (fromHexId, toHexId) => {
      dispatch(gameActions.moveRobot(fromHexId, toHexId));
    },
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
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <ManaCount mana={this.props.orangeMana}/>
            <Hand
              cards={this.props.orangeHand}
              isCurrentPlayer={this.props.currentTurn == 'orange'} />
            <Deck deck={this.props.orangeDeck} />
          </div>

          <Divider style={{marginTop: 10}}/>
          <div style={{
            position: 'relative'
          }}>
            <Board
              onSelectTile={(hexId, isMovementAction) => {
                if (isMovementAction) {
                  let tile = this.props.selectedTile;
                  if (this.props.currentTurn == 'blue') {
                    if (this.props.bluePieces[tile] && !this.props.bluePieces[tile].hasMoved) {
                      this.props.onMoveRobot(tile, hexId);
                    }
                  } else {
                    if (this.props.orangePieces[tile] && !this.props.orangePieces[tile].hasMoved) {
                      this.props.onMoveRobot(tile, hexId);
                    }
                  }
                } else {
                  this.props.onSelectTile(hexId, isMovementAction);
                }
              }}
              selectedTile={this.props.selectedTile}
              bluePieces={this.props.bluePieces}
              orangePieces={this.props.orangePieces}
              currentTurn={this.props.currentTurn} />
            <RaisedButton
              secondary
              label="End Turn"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                margin: 'auto',
                color: 'white'
              }}
              onTouchTap={(index) => {
                this.props.onPassTurn();
              }} />
          </div>
          <Divider style={{marginBottom: 10}}/>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <ManaCount mana={this.props.blueMana} />
            <Hand
              onSelectCard={(index) => {
                this.props.onSelectCard(index);
              }}
              selectedCard={this.props.selectedCard}
              isCurrentPlayer={this.props.currentTurn == 'blue'}
              cards={this.props.blueHand} />
            <Deck deck={this.props.blueDeck} />
          </div>
        </Paper>
        <Chat />
      </div>
    );
  }
}

Game.propTypes = {
  currentTurn: React.PropTypes.string,
  selectedTile: React.PropTypes.string,
  selectedCard: React.PropTypes.number,
  onMoveRobot: React.PropTypes.func,
  onSelectCard: React.PropTypes.func,
  onSelectTile: React.PropTypes.func,
  onPassTurn: React.PropTypes.func,
  blueHand: React.PropTypes.array,
  orangeHand: React.PropTypes.array,
  bluePieces: React.PropTypes.object,
  orangePieces: React.PropTypes.object,
  blueMana: React.PropTypes.object,
  orangeMana: React.PropTypes.object,
  blueDeck: React.PropTypes.array,
  orangeDeck: React.PropTypes.array
}

export default connect(mapStateToProps, mapDispatchToProps)(Game);
