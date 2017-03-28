import React, { Component } from 'react';
import Helmet from 'react-helmet';
import Paper from 'material-ui/lib/paper';
import RaisedButton from 'material-ui/lib/raised-button';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import { connect } from 'react-redux';
import { isNil, shuffle } from 'lodash';

import { SHUFFLE_DECKS } from '../constants';
import { instantiateCard } from '../util/common';
import { getAttribute } from '../util/game';
import Board from '../components/game/Board';
import PlayerArea from '../components/game/PlayerArea';
import Status from '../components/game/Status';
import CardViewer from '../components/game/CardViewer';
import VictoryScreen from '../components/game/VictoryScreen';
import * as gameActions from '../actions/game';

export function mapStateToProps(state) {
  return {
    connecting: state.game.connecting,
    started: state.game.started,
    player: state.game.player,
    currentTurn: state.game.currentTurn,
    winner: state.game.winner,

    selectedTile: state.game.player ? state.game.players[state.game.player].selectedTile : null,
    selectedCard: state.game.player ? state.game.players[state.game.player].selectedCard : null,
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

    sidebarOpen: state.layout && state.layout.present.sidebarOpen
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    onStartGame: (decks) => {
      dispatch([
        {type: 'ws:CONNECT', payload: {decks: decks}},
        gameActions.startGame(decks)
      ]);
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
    onSelectCard: (index, player) => {
      dispatch(gameActions.setSelectedCard(index, player));
    },
    onSelectTile: (hexId, player) => {
      dispatch(gameActions.setSelectedTile(hexId, player));
    },
    onHoverCard: (index) => {
      dispatch(gameActions.setHoveredCard(index));
    },
    onHoverTile: (card) => {
      dispatch(gameActions.setHoveredTile(card));
    },
    onClick: () => {
      dispatch(gameActions.newGame());
    }
  };
}

export class Game extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedOrangeDeck: 0,
      selectedBlueDeck: 0
    };
  }

  isMyTurn() {
    return this.props.currentTurn === this.props.player;
  }

  allPieces() {
    return Object.assign({}, this.props.bluePieces, this.props.orangePieces);
  }

  hoveredCard() {
    const hand = this.props[`${this.props.player}Hand`];
    const cardFromIndex = (idx => {
      if (!isNil(idx) && hand[idx]) {
        const card = hand[idx];
        return {card: card, stats: card.stats};
      }
    });

    return this.props.hoveredCard ||
      cardFromIndex(this.props.hoveredCardIdx) ||
      cardFromIndex(this.props.selectedCard) ||
      this.allPieces()[this.props.selectedTile];
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
      this.props.onSelectTile(hexId, this.props.player);
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
        isActivePlayer={this.props.player === color}
        isCurrentPlayer={this.props.currentTurn === color}
        status={this.props.status}
        energy={this.props[`${color}Energy`]}
        cards={this.props[`${color}Hand`]}
        deck={this.props[`${color}Deck`]}
        selectedCard={this.props.selectedCard}
        hoveredCard={this.props.hoveredCardIdx}
        targetableCards={this.props.player === color ? this.props.target.possibleCards : []}
        onSelectCard={this.props.onSelectCard}
        onHoverCard={this.props.onHoverCard} />
    );
  }

  renderDeckSelector(color) {
    return (
      <SelectField
        value={this.state[`selected${color}Deck`]}
        floatingLabelText={`${color} player deck`}
        style={{width: '80%', marginRight: 25}}
        onChange={(e, idx, value) => {
          this.setState(state => state[`selected${color}Deck`] = idx);
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
        <div style={{paddingLeft: padding, margin: '48px auto', width: 800}}>
          <Helmet title="Game"/>
          <Paper style={{padding: 20, position: 'relative'}}>
            {this.renderDeckSelector('Orange')}
            {this.renderDeckSelector('Blue')}
            <RaisedButton
              secondary
              label="Start Game"
              style={{position: 'absolute', top: 0, bottom: 0, right: 20, margin: 'auto', color: 'white'}}
              onTouchTap={e => {
                const [orangeDeck, blueDeck] = [this.state.selectedOrangeDeck, this.state.selectedBlueDeck].map(deck =>
                  this.props.availableDecks[deck].cards.map(instantiateCard)
                );

                this.props.onStartGame({
                  orange: SHUFFLE_DECKS ? shuffle(orangeDeck) : orangeDeck,
                  blue: SHUFFLE_DECKS ? shuffle(blueDeck) : blueDeck
                });
              }} />
          </Paper>
        </div>
      );
    } else if (!this.props.connecting) {
      return (
        <div style={{paddingLeft: padding, margin: '48px 72px'}}>
          <Helmet title="Game"/>
          <Paper style={{padding: 20, position: 'relative'}}>
            {this.renderPlayerArea('orange')}

            <div style={{position: 'relative'}}>
              <CardViewer hoveredCard={this.hoveredCard()} />
              <Status
                currentTurn={this.props.currentTurn}
                status={this.isMyTurn() ? this.props.status : {}} />
              <Board
                player={this.props.player}
                currentTurn={this.props.currentTurn}
                selectedTile={this.props.selectedTile}
                target={this.props.target}
                bluePieces={this.props.bluePieces}
                orangePieces={this.props.orangePieces}
                playingCardType={this.props.playingCardType}
                onSelectTile={(hexId, action, intmedMoveHexId) => this.onSelectTile(hexId, action, intmedMoveHexId)}
                onHoverTile={(hexId, action) => this.onHoverTile(hexId, action)} />
              <RaisedButton
                secondary
                disabled={!this.isMyTurn()}
                label="End Turn"
                style={{position: 'absolute', top: 0, bottom: 0, right: 0, margin: 'auto', color: 'white'}}
                onTouchTap={this.props.onPassTurn} />
            </div>

            {this.renderPlayerArea('blue')}

            <VictoryScreen winner={this.props.winner} onClick={this.props.onClick} />
          </Paper>
        </div>
      );
    }
  }
}

const { array, bool, func, number, object, string } = React.PropTypes;

Game.propTypes = {
  connecting: bool,
  started: bool,
  player: string,
  currentTurn: string,
  selectedTile: string,
  playingCardType: number,
  status: object,
  target: object,
  hoveredCard: object,
  winner: string,

  blueHand: array,
  orangeHand: array,

  bluePieces: object,
  orangePieces: object,

  blueEnergy: object,
  orangeEnergy: object,

  blueDeck: array,
  orangeDeck: array,

  availableDecks: array,

  selectedCard: number,
  hoveredCardIdx: number,

  sidebarOpen: bool,

  onStartGame: func,
  onMoveRobot: func,
  onAttackRobot: func,
  onMoveRobotAndAttack: func,
  onPlaceRobot: func,
  onSelectCard: func,
  onSelectTile: func,
  onPassTurn: func,
  onHoverCard: func,
  onHoverTile: func,
  onClick: func
};

export default connect(mapStateToProps, mapDispatchToProps)(Game);
