import React, { Component } from 'react';
import Helmet from 'react-helmet';
import Paper from 'material-ui/lib/paper';
import RaisedButton from 'material-ui/lib/raised-button';
import TextField from 'material-ui/lib/text-field';
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
import * as socketActions from '../actions/socket';

export function mapStateToProps(state) {
  const activePlayer = state.game.players[state.game.player];
  const currentPlayer = state.game.players[state.game.currentTurn];

  return {
    started: state.game.started,
    player: state.game.player,
    currentTurn: state.game.currentTurn,
    winner: state.game.winner,

    selectedTile: activePlayer.selectedTile,
    selectedCard: activePlayer.selectedCard,
    hoveredCardIdx: state.game.hoveredCardIdx,
    hoveredCard: state.game.hoveredCard,
    playingCardType: currentPlayer.selectedCard !== null ? currentPlayer.hand[currentPlayer.selectedCard].type : null,

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

    numPlayersOnline: state.socket.numPlayersOnline,
    waitingPlayers: state.socket.waitingPlayers,
    hosting: state.socket.hosting,
    availableDecks: state.collection.decks,

    sidebarOpen: state.layout && state.layout.present.sidebarOpen
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    onHostGame: (name, deck) => {
      dispatch(socketActions.host(name, deck));
    },
    onJoinGame: (id, deck) => {
      dispatch(socketActions.join(id, deck));
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
      gameName: '',
      selectedDeck: 0
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

  renderLobby() {
    const paperStyle = {padding: 20, marginBottom: 20, position: 'relative'};
    const buttonStyle = {position: 'absolute', top: 0, bottom: 0, right: 20, margin: 'auto', color: 'white'};

    const [numPlayersElt, waitingElt, chooseDeckElt, joinGamesElt, startNewGameElt] = [
      <Paper style={paperStyle}>
        <div>{this.props.numPlayersOnline} player(s) online</div>
      </Paper>,

      <Paper style={paperStyle}>
        <div>Waiting for an opponent ...</div>
      </Paper>,

      <Paper style={paperStyle}>
        <SelectField
          value={this.state['selectedDeck']}
          floatingLabelText="Choose a deck"
          style={{width: '80%', marginRight: 25}}
          onChange={(e, idx, value) => {
            this.setState(state => state.selectedDeck = idx);
          }}>
          {this.props.availableDecks.map((deck, idx) =>
            <MenuItem key={idx} value={idx} primaryText={`${deck.name} (${deck.cards.length} cards)`}/>
          )}
        </SelectField>
      </Paper>,

      (this.props.waitingPlayers || []).map(game =>
        <Paper style={paperStyle} key={game.id}>
          <div>
            <b>{game.name}</b>
          </div>
          <RaisedButton
            secondary
            label="Join Game"
            style={buttonStyle}
            onTouchTap={e => {
              const deck = this.props.availableDecks[this.state.selectedDeck].cards.map(instantiateCard);
              this.props.onJoinGame(game.id, SHUFFLE_DECKS ? shuffle(deck) : deck);
            }} />
        </Paper>
      ),

      <Paper style={paperStyle}>
        <TextField
          value={this.state['gameName']}
          floatingLabelText="Game name"
          style={{width: '50%'}}
          onChange={e => { this.setState({gameName: e.target.value}); }} />
        <RaisedButton
          secondary
          disabled={this.state.gameName === ''}
          label="Host New Game"
          style={buttonStyle}
          onTouchTap={e => {
            const deck = this.props.availableDecks[this.state.selectedDeck].cards.map(instantiateCard);
            this.props.onHostGame(this.state.gameName, SHUFFLE_DECKS ? shuffle(deck) : deck);
          }} />
      </Paper>
    ];

    if (this.props.hosting) {
      return (
        <div>
          {numPlayersElt}
          {waitingElt}
        </div>
      );
    } else {
      return (
        <div>
          {numPlayersElt}
          {chooseDeckElt}
          {joinGamesElt}
          {startNewGameElt}
        </div>
      );
    }
  }

  renderGameArea() {
    return (
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
    );
  }

  render() {
    return (
      <div style={{
        paddingLeft: this.props.sidebarOpen ? 256 : 0,
        margin: '48px 72px'
      }}>
        <Helmet title="Game"/>
        {this.props.started ? this.renderGameArea() : this.renderLobby()}
      </div>
    );
  }
}

const { array, bool, func, number, object, string } = React.PropTypes;

Game.propTypes = {
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

  numPlayersOnline: number,
  waitingPlayers: array,
  hosting: bool,
  availableDecks: array,

  selectedCard: number,
  hoveredCardIdx: number,

  sidebarOpen: bool,

  onHostGame: func,
  onJoinGame: func,
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
