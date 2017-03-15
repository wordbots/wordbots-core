import React, { Component } from 'react';
import Helmet from 'react-helmet';
import Paper from 'material-ui/lib/paper';
import RaisedButton from 'material-ui/lib/raised-button';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import { connect } from 'react-redux';
import { shuffle } from 'lodash';

import { getAttribute } from '../util';
import Board from '../components/game/Board';
import PlayerArea from '../components/game/PlayerArea';
import Status from '../components/game/Status';
import CardViewer from '../components/game/CardViewer';
import VictoryScreen from '../components/game/VictoryScreen';
import * as gameActions from '../actions/game';

export function mapStateToProps(state) {
  return {
    started: state.game.started,
    currentTurn: state.game.currentTurn,
    winner: state.game.winner,

    selectedTile: state.game.selectedTile,
    selectedCard: state.game.selectedCard,
    hoveredCardIdx: state.game.hoveredCardIdx,
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
    orangeDeck: state.game.players.orange.deck,

    availableDecks: state.collection.decks,

    sidebarOpen: state.layout.present.sidebarOpen
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    onStartGame: (decks) => {
      dispatch(gameActions.startGame(decks));
    },
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
    onHoverCard: (index) => {
      dispatch(gameActions.setHoveredCard(index));
    },
    onHoverTile: (card) => {
      dispatch(gameActions.setHoveredTile(card));
    },
    onVictoryScreenClick: () => {
      dispatch(gameActions.newGame());
    }
  };
}

export class Game extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedOrangeDeck: props.availableDecks[0],
      selectedBlueDeck: props.availableDecks[0]
    };
  }

  allPieces() {
    return Object.assign({}, this.props.bluePieces, this.props.orangePieces);
  }

  movePiece(hexId, asPartOfAttack = false) {
    this.props.onMoveRobot(this.props.selectedTile, hexId, asPartOfAttack);
  }

  attackPiece(hexId, intermediateMoveHexId) {
    if (intermediateMoveHexId) {
      this.props.onMoveRobotAndAttack(this.props.selectedTile, intermediateMoveHexId, hexId);
    } else {
      this.props.onAttackRobot(this.props.selectedTile, hexId);
    }
  }

  placePiece(hexId) {
    const card = this.props[`${this.props.currentTurn}Hand`][this.props.selectedCard];
    this.props.onPlaceRobot(hexId, card);
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
    if (action === 'mouseleave') {
      this.props.onHoverTile(null);
    } else {
      const piece = this.props.bluePieces[hexId] || this.props.orangePieces[hexId];

      if (piece) {
        this.props.onHoverTile({
          card: piece.card,
          stats: {
            attack: getAttribute(piece, 'attack'),
            speed: getAttribute(piece, 'speed'),
            health: getAttribute(piece, 'health')
          }
        });
      }
    }
  }

  renderPlayerArea(color) {
    return (
      <PlayerArea
        name={color}
        isCurrentPlayer={this.props.currentTurn === color}
        status={this.props.status}
        energy={this.props[`${color}Energy`]}
        cards={this.props[`${color}Hand`]}
        deck={this.props[`${color}Deck`]}
        selectedCard={this.props.selectedCard}
        hoveredCard={this.props.hoveredCardIdx}
        targetableCards={this.props.currentTurn === color ? this.props.target.possibleCards : []}
        onSelectCard={this.props.onSelectCard}
        onHoverCard={this.props.onHoverCard} />
    );
  }

  renderDeckSelector(color) {
    return (
      <SelectField
        value={0}
        floatingLabelText={`${color} player deck`}
        style={{width: '80%', marginRight: 25}}
        onChange={(e, idx, value) => {
          this.setState(state => state[`selected${color}Deck`] = this.props.availableDecks[idx]);
        }}>
        {this.props.availableDecks.map((deck, idx) =>
          <MenuItem key={idx} value={idx} primaryText={`${deck.name} (${deck.cards.length} cards)`}/>
        )}
      </SelectField>
    );
  }

  render() {
    const padding = this.props.sidebarOpen ? 256 : 0;

    if (!this.props.started) {
      return (
        <div style={{paddingLeft: padding, margin: '48px auto', width: '800px'}}>
          <Paper style={{padding: 20, position: 'relative', width: '80%'}}>
          {this.renderDeckSelector('Orange')}
          {this.renderDeckSelector('Blue')}
          <RaisedButton
            secondary
            label="Start Game"
            style={{position: 'absolute', top: 0, bottom: 0, right: 20, margin: 'auto', color: 'white'}}
            onTouchTap={e => {
              this.props.onStartGame({
                // Remove the shuffle() calls here to test individual cards.
                orange: {cards: shuffle(this.state.selectedOrangeDeck.cards)},
                blue: {cards: shuffle(this.state.selectedBlueDeck.cards)}
              });
            }} />
          </Paper>
        </div>
      );
    } else {
      return (
        <div style={{paddingLeft: padding, margin: '48px 72px'}}>
          <Helmet title="Game"/>
          <Paper style={{padding: 20, position: 'relative'}}>
            {this.renderPlayerArea('orange')}

            <div style={{position: 'relative'}}>
              <CardViewer hoveredCard={this.props.hoveredCard} />
              <Status
                currentTurn={this.props.currentTurn}
                status={this.props.status} />
              <Board
                selectedTile={this.props.selectedTile}
                target={this.props.target}
                bluePieces={this.props.bluePieces}
                orangePieces={this.props.orangePieces}
                currentTurn={this.props.currentTurn}
                playingCardType={this.props.playingCardType}
                onSelectTile={(hexId, action, intmedMoveHexId) => this.onSelectTile(hexId, action, intmedMoveHexId)}
                onHoverTile={(hexId, action) => this.onHoverTile(hexId, action)} />
              <RaisedButton
                secondary
                label="End Turn"
                style={{position: 'absolute', top: 0, bottom: 0, right: 0, margin: 'auto', color: 'white'}}
                onTouchTap={this.props.onPassTurn} />
            </div>

            {this.renderPlayerArea('blue')}

            <VictoryScreen winner={this.props.winner} onVictoryScreenClick={this.props.onVictoryScreenClick} />
          </Paper>
        </div>
      );
    }
  }
}

Game.propTypes = {
  started: React.PropTypes.bool,
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

  availableDecks: React.PropTypes.array,

  selectedCard: React.PropTypes.number,
  hoveredCardIdx: React.PropTypes.number,

  sidebarOpen: React.PropTypes.bool,

  onStartGame: React.PropTypes.func,
  onMoveRobot: React.PropTypes.func,
  onAttackRobot: React.PropTypes.func,
  onMoveRobotAndAttack: React.PropTypes.func,
  onPlaceRobot: React.PropTypes.func,
  onSelectCard: React.PropTypes.func,
  onSelectTile: React.PropTypes.func,
  onPassTurn: React.PropTypes.func,
  onHoverCard: React.PropTypes.func,
  onHoverTile: React.PropTypes.func,
  onVictoryScreenClick: React.PropTypes.func
};

export default connect(mapStateToProps, mapDispatchToProps)(Game);
