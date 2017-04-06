import React, { Component } from 'react';
import Helmet from 'react-helmet';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import { connect } from 'react-redux';
import { isNil } from 'lodash';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import { getAttribute } from '../util/game';
import Board from '../components/game/Board';
import CardViewer from '../components/game/CardViewer';
import PlayerArea from '../components/game/PlayerArea';
import Status from '../components/game/Status';
import VictoryScreen from '../components/game/VictoryScreen';
import Chat from '../components/multiplayer/Chat';
import Lobby from '../components/multiplayer/Lobby';
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
    actionLog: state.game.actionLog,

    selectedTile: activePlayer.selectedTile,
    selectedCard: activePlayer.selectedCard,
    hoveredCardIdx: state.game.hoveredCardIdx,
    hoveredCard: state.game.hoveredCard,
    playingCardType: currentPlayer.selectedCard !== null ? currentPlayer.hand[currentPlayer.selectedCard].type : null,

    status: activePlayer.status,
    target: state.game.target,

    blueHand: state.game.players.blue.hand,
    orangeHand: state.game.players.orange.hand,

    bluePieces: state.game.players.blue.robotsOnBoard,
    orangePieces: state.game.players.orange.robotsOnBoard,

    blueEnergy: state.game.players.blue.energy,
    orangeEnergy: state.game.players.orange.energy,

    blueDeck: state.game.players.blue.deck,
    orangeDeck: state.game.players.orange.deck,

    socket: state.socket,
    availableDecks: state.collection.decks,

    sidebarOpen: state.layout.present.sidebarOpen
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    onConnect: () => {
      dispatch(socketActions.connect());
    },
    onHostGame: (name, deck) => {
      dispatch(socketActions.host(name, deck));
    },
    onJoinGame: (id, name, deck) => {
      dispatch(socketActions.join(id, name, deck));
    },
    onSetUsername: (username) => {
      dispatch(socketActions.setUsername(username));
    },
    onSendChatMessage: (msg) => {
      dispatch(socketActions.chat(msg));
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
    onVictoryScreenClick: () => {
      dispatch([
        gameActions.newGame(),
        socketActions.leave()
      ]);
    }
  };
}

export class Game extends Component {
  // For testing.
  getChildContext() {
    return {muiTheme: getMuiTheme(baseTheme)};
  }

  componentDidMount() {
    if (!this.props.socket.connected) {
      this.props.onConnect();
    }
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

  renderGameArea() {
    if (this.props.started) {
      return (
        <Paper style={{padding: 20, position: 'relative'}}>
          <PlayerArea
            color="orange"
            gameProps={this.props} />

          <div style={{position: 'relative'}}>
            <CardViewer hoveredCard={this.hoveredCard()} />
            <Status
              player={this.props.player}
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
            <div style={{position: 'absolute', top: 0, bottom: 0, right: 0, height: 36, margin: 'auto', color: 'white'}}>
              <RaisedButton
                secondary
                disabled={!this.isMyTurn()}
                label="End Turn"
                onTouchTap={this.props.onPassTurn} />
            </div>
          </div>

          <PlayerArea
            color="blue"
            gameProps={this.props} />
          <VictoryScreen
            winner={this.props.winner}
            onClick={this.props.onVictoryScreenClick} />
        </Paper>
      );
    } else {
      return (
        <Lobby
          socket={this.props.socket}
          availableDecks={this.props.availableDecks}
          onConnect={this.props.onConnect}
          onHostGame={this.props.onHostGame}
          onJoinGame={this.props.onJoinGame}
          onSetUsername={this.props.onSetUsername} />
      );
    }
  }

  render() {
    return (
      <div style={{
        paddingLeft: this.props.sidebarOpen ? 256 : 0,
        paddingRight: 256,
        margin: '48px 72px'
      }}>
        <Helmet title="Game"/>
        {this.renderGameArea()}
        <Chat
          roomName={this.props.socket.hosting ? null : this.props.socket.gameName}
          messages={this.props.socket.chatMessages.concat(this.props.actionLog)}
          onSendMessage={this.props.onSendChatMessage}
          onHoverCard={this.props.onHoverTile} />
      </div>
    );
  }
}

const { array, bool, func, number, object, string } = React.PropTypes;

// For testing.
Game.childContextTypes = {
  muiTheme: object.isRequired
};

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
  actionLog: array,

  blueHand: array,
  orangeHand: array,

  bluePieces: object,
  orangePieces: object,

  blueEnergy: object,
  orangeEnergy: object,

  blueDeck: array,
  orangeDeck: array,

  socket: object,
  availableDecks: array,

  selectedCard: number,
  hoveredCardIdx: number,

  sidebarOpen: bool,

  onConnect: func,
  onHostGame: func,
  onJoinGame: func,
  onSetUsername: func,
  onSendChatMessage: func,
  onMoveRobot: func,
  onAttackRobot: func,
  onMoveRobotAndAttack: func,
  onPlaceRobot: func,
  onSelectCard: func,
  onSelectTile: func,
  onPassTurn: func,
  onHoverCard: func,
  onHoverTile: func,
  onVictoryScreenClick: func
};

export default connect(mapStateToProps, mapDispatchToProps)(Game);
