import React, { Component } from 'react';
import Helmet from 'react-helmet';
import Paper from 'material-ui/lib/paper';
import Divider from 'material-ui/lib/divider';
import RaisedButton from 'material-ui/lib/raised-button';
import { connect } from 'react-redux';

import Board from '../components/game/Board';
import Chat from '../components/game/Chat';
import PlayerArea from '../components/game/PlayerArea';
import Status from '../components/game/Status';
import CardViewer from '../components/game/CardViewer';
import VictoryScreen from '../components/game/VictoryScreen';
import * as gameActions from '../actions/game';

function mapStateToProps(state) {
  return {
    currentTurn: state.game.currentTurn,
    winner: state.game.winner,

    selectedTile: state.game.selectedTile,
    selectedCard: state.game.selectedCard,
    hoveredCard: state.game.hoveredCard,
    playingCardType: state.game.playingCardType,

    status: state.game.status,
    target: state.game.target,

    blueHand: state.game.players.blue.hand,
    orangeHand: state.game.players.orange.hand,

    bluePieces: state.game.players.blue.robotsOnBoard,
    orangePieces: state.game.players.orange.robotsOnBoard,

    blueEnergy: state.game.players.blue.energy,
    orangeEnergy: state.game.players.orange.energy,

    blueDeck: state.game.players.blue.deck,
    orangeDeck: state.game.players.orange.deck
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onMoveRobot: (fromHexId, toHexId) => {
      dispatch(gameActions.moveRobot(fromHexId, toHexId));
    },
    onAttackRobot: (sourceHexId, targetHexId) => {
      dispatch(gameActions.attack(sourceHexId, targetHexId));
    },
    onMoveRobotAndAttack: (fromHexId, toHexId, targetHexId) => {
      dispatch(gameActions.moveRobotAndAttack(fromHexId, toHexId, targetHexId));
    },
    onPlaceRobot: (tileHexId, card) => {
      dispatch(gameActions.placeCard(tileHexId, card));
    },
    onPassTurn: () => {
      dispatch(gameActions.passTurn());
    },
    onSelectCard: (index) => {
      dispatch(gameActions.setSelectedCard(index));
    },
    onSelectTile: (hexId) => {
      dispatch(gameActions.setSelectedTile(hexId));
    },
    onHoverTile: (card) => {
      dispatch(gameActions.setHoveredCard(card));
    }
  };
}

class Game extends Component {
  constructor(props) {
    super(props);
  }

  movePiece(hexId, asPartOfAttack = false) {
    let tile = this.props.selectedTile;
    if (this.props.currentTurn == 'blue') {
      if (this.props.bluePieces[tile] && !this.props.bluePieces[tile].hasMoved) {
        this.props.onMoveRobot(tile, hexId, asPartOfAttack);
      }
    } else {
      if (this.props.orangePieces[tile] && !this.props.orangePieces[tile].hasMoved) {
        this.props.onMoveRobot(tile, hexId, asPartOfAttack);
      }
    }
  }

  attackPiece(hexId, intermediateMoveHexId) {
    let tile = this.props.selectedTile;
    if (this.props.currentTurn == 'blue') {
      if (this.props.bluePieces[tile] && !this.props.bluePieces[tile].hasMoved) {
        if (intermediateMoveHexId) {
          this.props.onMoveRobotAndAttack(tile, intermediateMoveHexId, hexId);
        } else {
          this.props.onAttackRobot(tile, hexId);
        }
      }
    } else {
      if (this.props.orangePieces[tile] && !this.props.orangePieces[tile].hasMoved) {
        if (intermediateMoveHexId) {
          this.props.onMoveRobotAndAttack(tile, intermediateMoveHexId, hexId);
        } else {
          this.props.onAttackRobot(tile, hexId);
        }
      }
    }
  }

  placePiece(hexId) {
    if (this.props.currentTurn == 'blue') {
      this.props.onPlaceRobot(hexId, this.props.blueHand[this.props.selectedCard]);
    } else {
      this.props.onPlaceRobot(hexId, this.props.orangeHand[this.props.selectedCard]);
    }
  }

  onSelectTile(hexId, action, intermediateMoveHexId) {
    if (action === 'move') {
      this.movePiece(hexId);
    } else if (action === 'attack') {
      this.attackPiece(hexId, intermediateMoveHexId);
    } else if (action === 'place') {
      this.placePiece(hexId);
    } else {
      this.props.onSelectTile(hexId);
    }
  }

  onHoverTile(hexId, action) {
    if (action == 'mouseleave') {
      this.props.onHoverTile(null);
      return;
    }

    if (this.props.bluePieces[hexId]) {
      this.props.onHoverTile(this.props.bluePieces[hexId].card);
    } else if (this.props.orangePieces[hexId]) {
      this.props.onHoverTile(this.props.orangePieces[hexId].card);
    }
  }

  render() {
    return (
      <div style={{paddingLeft: 256, paddingRight: 256, paddingTop: 64, margin: '48px 72px'}}>
        <Helmet title="Game"/>
        <Paper style={{padding: 20, position: 'relative'}}>
          <PlayerArea
            energy={this.props.orangeEnergy}
            onSelectCard={(index) => this.props.onSelectCard(index)}
            selectedCard={this.props.selectedCard}
            isCurrentPlayer={this.props.currentTurn == 'orange'}
            cards={this.props.orangeHand}
            status={this.props.status}
            deck={this.props.orangeDeck} />

          <Divider style={{marginTop: 10}}/>

          <div style={{
            position: 'relative'
          }}>
            <CardViewer card={this.props.hoveredCard} />
            <Status
              currentTurn={this.props.currentTurn}
              status={this.props.status} />
            <Board
              onSelectTile={(hexId, action, intmedMoveHexId) => this.onSelectTile(hexId, action, intmedMoveHexId)}
              onHoverTile={(hexId, action) => this.onHoverTile(hexId, action)}
              selectedTile={this.props.selectedTile}
              target={this.props.target}
              bluePieces={this.props.bluePieces}
              orangePieces={this.props.orangePieces}
              currentTurn={this.props.currentTurn}
              playingCardType={this.props.playingCardType} />
            <RaisedButton
              secondary
              label="End Turn"
              style={{position: 'absolute', top: 0, bottom: 0, right: 0, margin: 'auto', color: 'white'}}
              onTouchTap={(index) => this.props.onPassTurn()} />
          </div>

          <Divider style={{marginBottom: 10}}/>

          <PlayerArea
            energy={this.props.blueEnergy}
            onSelectCard={(index) => this.props.onSelectCard(index)}
            selectedCard={this.props.selectedCard}
            isCurrentPlayer={this.props.currentTurn == 'blue'}
            cards={this.props.blueHand}
            status={this.props.status}
            deck={this.props.blueDeck} />

          <VictoryScreen winner={this.props.winner} />
        </Paper>
        <Chat />
      </div>
    );
  }
}

Game.propTypes = {
  currentTurn: React.PropTypes.string,
  selectedTile: React.PropTypes.string,
  playingCardType: React.PropTypes.number,
  status: React.PropTypes.object,
  target: React.PropTypes.object,
  hoveredCard: React.PropTypes.object,
  winner: React.PropTypes.string,

  blueHand: React.PropTypes.array,
  orangeHand: React.PropTypes.array,

  bluePieces: React.PropTypes.object,
  orangePieces: React.PropTypes.object,

  blueEnergy: React.PropTypes.object,
  orangeEnergy: React.PropTypes.object,

  blueDeck: React.PropTypes.array,
  orangeDeck: React.PropTypes.array,

  selectedCard: React.PropTypes.number,

  onMoveRobot: React.PropTypes.func,
  onAttackRobot: React.PropTypes.func,
  onMoveRobotAndAttack: React.PropTypes.func,
  onPlaceRobot: React.PropTypes.func,
  onSelectCard: React.PropTypes.func,
  onSelectTile: React.PropTypes.func,
  onPassTurn: React.PropTypes.func,
  onHoverTile: React.PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(Game);
