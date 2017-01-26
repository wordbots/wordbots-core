import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import ReactTooltip from 'react-tooltip';

import Board from '../components/game/Board';
import Chat from '../components/game/Chat';
import PlayerArea from '../components/game/PlayerArea';
import Status from '../components/game/Status';

import Paper from 'material-ui/lib/paper';
import Divider from 'material-ui/lib/divider';
import RaisedButton from 'material-ui/lib/raised-button';

import { connect } from 'react-redux';
import * as gameActions from '../actions/game';

function mapStateToProps(state) {
  return {
    currentTurn: state.game.currentTurn,
    selectedTile: state.game.selectedTile,
    placingRobot: state.game.placingRobot,
    status: state.game.status,

    blueSelectedCard: state.game.players.blue.selectedCard,
    orangeSelectedCard: state.game.players.orange.selectedCard,

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
    }
  }
}

class Game extends Component {
  constructor(props) {
    super(props);
  }

  placePiece(hexId) {
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
  }

  movePiece(hexId) {
    if (this.props.currentTurn == 'blue') {
      this.props.onPlaceRobot(hexId, this.props.blueHand[this.props.blueSelectedCard]);
    } else {
      this.props.onPlaceRobot(hexId, this.props.orangeHand[this.props.orangeSelectedCard]);
    }
  }

  onSelectTile(hexId, action) {
    if (action === 'move') {
      this.placePiece(hexId);
    } else if (action === 'place') {
      this.movePiece(hexId);
    } else {
      this.props.onSelectTile(hexId);
    }
  }

  render() {
    return (
      <div style={{paddingLeft: 256, paddingRight: 256, paddingTop: 64, margin: '48px 72px'}}>
        <Helmet title="Game"/>
        <Paper style={{padding: 20}}>
          <PlayerArea
            energy={this.props.orangeEnergy}
            onSelectCard={(index) => this.props.onSelectCard(index)}
            selectedCard={this.props.orangeSelectedCard}
            isCurrentPlayer={this.props.currentTurn == 'orange'}
            cards={this.props.orangeHand}
            status={this.props.status}
            deck={this.props.orangeDeck} />

          <Divider style={{marginTop: 10}}/>

          <div style={{
            position: 'relative'
          }}>
            <Status
              currentTurn={this.props.currentTurn}
              status={this.props.status} />
            <Board
              onSelectTile={(hexId, action) => this.onSelectTile(hexId, action)}
              selectedTile={this.props.selectedTile}
              bluePieces={this.props.bluePieces}
              orangePieces={this.props.orangePieces}
              currentTurn={this.props.currentTurn}
              placingRobot={this.props.placingRobot} />
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
            selectedCard={this.props.blueSelectedCard}
            isCurrentPlayer={this.props.currentTurn == 'blue'}
            cards={this.props.blueHand}
            status={this.props.status}
            deck={this.props.blueDeck} />
        </Paper>
        <Chat />
      </div>
    );
  }
}

Game.propTypes = {
  currentTurn: React.PropTypes.string,
  selectedTile: React.PropTypes.string,
  placingRobot: React.PropTypes.bool,
  status: React.PropTypes.object,

  blueHand: React.PropTypes.array,
  orangeHand: React.PropTypes.array,

  bluePieces: React.PropTypes.object,
  orangePieces: React.PropTypes.object,

  blueEnergy: React.PropTypes.object,
  orangeEnergy: React.PropTypes.object,

  blueDeck: React.PropTypes.array,
  orangeDeck: React.PropTypes.array,

  blueSelectedCard: React.PropTypes.number,
  orangeSelectedCard: React.PropTypes.number,

  onMoveRobot: React.PropTypes.func,
  onPlaceRobot: React.PropTypes.func,
  onSelectCard: React.PropTypes.func,
  onSelectTile: React.PropTypes.func,
  onPassTurn: React.PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(Game);
