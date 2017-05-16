import React, { Component } from 'react';
import { array, bool, func, number, object, string } from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Notification from 'react-web-notification';
import Paper from 'material-ui/Paper';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { isNil } from 'lodash';

import { inBrowser } from '../util/common';
import { getAttribute } from '../util/game';
import CardViewer from '../components/card/CardViewer';
import Board from '../components/game/Board';
import PlayerArea from '../components/game/PlayerArea';
import Status from '../components/game/Status';
import Sfx from '../components/game/Sfx';
import VictoryScreen from '../components/game/VictoryScreen';
import * as gameActions from '../actions/game';
import * as socketActions from '../actions/socket';
import { arbitraryPlayerState } from '../store/defaultGameState';

export function mapStateToProps(state) {
  const activePlayer = state.game.players[state.game.player] || arbitraryPlayerState();
  const currentPlayer = state.game.players[state.game.currentTurn];

  return {
    player: state.game.player,
    currentTurn: state.game.currentTurn,
    usernames: state.game.usernames,
    winner: state.game.winner,

    selectedTile: activePlayer.selectedTile,
    selectedCard: activePlayer.selectedCard,
    hoveredCardIdx: state.game.hoveredCardIdx,
    hoveredCard: state.game.hoveredCard,
    playingCardType: currentPlayer.selectedCard !== null ? currentPlayer.hand[currentPlayer.selectedCard].type : null,

    status: activePlayer.status,
    target: activePlayer.target,

    blueHand: state.game.players.blue.hand,
    orangeHand: state.game.players.orange.hand,

    bluePieces: state.game.players.blue.robotsOnBoard,
    orangePieces: state.game.players.orange.robotsOnBoard,

    blueEnergy: state.game.players.blue.energy,
    orangeEnergy: state.game.players.orange.energy,

    blueDeck: state.game.players.blue.deck,
    orangeDeck: state.game.players.orange.deck,

    sfxQueue: state.game.sfxQueue,

    sidebarOpen: state.global.sidebarOpen
  };
}

export function mapDispatchToProps(dispatch) {
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
    onPlaceRobot: (tileHexId, cardIdx) => {
      dispatch(gameActions.placeCard(tileHexId, cardIdx));
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
        gameActions.endGame(),
        socketActions.leave()
      ]);
    }
  };
}

export class GameArea extends Component {
  static propTypes = {
    player: string,
    currentTurn: string,
    usernames: object,
    winner: string,

    selectedTile: string,
    selectedCard: number,
    hoveredCard: object,
    hoveredCardIdx: number,
    playingCardType: number,

    status: object,
    target: object,

    blueHand: array,
    orangeHand: array,

    bluePieces: object,
    orangePieces: object,

    blueEnergy: object,
    orangeEnergy: object,

    blueDeck: array,
    orangeDeck: array,

    sfxQueue: array,

    sidebarOpen: bool,

    onMoveRobot: func,
    onAttackRobot: func,
    onMoveRobotAndAttack: func,
    onPlaceRobot: func,
    onSelectCard: func,
    onSelectTile: func,
    onHoverCard: func,
    onHoverTile: func,
    onVictoryScreenClick: func
  };


  // For testing.
  static childContextTypes = {
    muiTheme: object.isRequired
  };
  getChildContext() {
    return {muiTheme: getMuiTheme(baseTheme)};
  }

  constructor(props) {
    super(props);

    this.state = {
      areaHeight: 1250,
      boardSize: 1000
    };
  }

  componentDidMount() {
    this.updateDimensions();
    window.onresize = () => { this.updateDimensions(); };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.sidebarOpen !== this.props.sidebarOpen) {
      this.updateDimensions(nextProps);
    }
  }

  updateDimensions(props = this.props) {
    const maxBoardHeight = window.innerHeight - 64 - 150;
    const maxBoardWidth = window.innerWidth - (props.sidebarOpen ? 512 : 256);

    this.setState({
      areaHeight: window.innerHeight - 64,
      boardSize: Math.min(maxBoardWidth, maxBoardHeight)
    });
  }

  isMyTurn() {
    return this.props.currentTurn === this.props.player;
  }

  allPieces() {
    return Object.assign({}, this.props.bluePieces, this.props.orangePieces);
  }

  myPieces() {
    return this.props.player === 'blue' ? this.props.bluePieces : this.props.orangePieces;
  }

  hoveredCard() {
    const hand = this.props[`${this.props.player}Hand`];

    const cardFromIndex = (idx) => {
      if (!isNil(idx) && hand[idx]) {
        const card = hand[idx];
        return {card: card, stats: card.stats};
      }
    };
    const cardFromHex = (hex) => {
      const piece = this.allPieces()[hex];
      if (piece) {
        return {
          card: piece.card,
          stats: {
            attack: getAttribute(piece, 'attack'),
            health: getAttribute(piece, 'health'),
            speed: getAttribute(piece, 'speed')
          }
        };
      }
    };

    return this.props.hoveredCard ||
      cardFromIndex(this.props.hoveredCardIdx) ||
      cardFromIndex(this.props.selectedCard) ||
      cardFromHex(this.props.selectedTile);
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
    this.props.onPlaceRobot(hexId, this.props.selectedCard);
  }

  onSelectTile(hexId, action = null, intermediateMoveHexId = null) {
    if (action === 'move') {
      this.movePiece(hexId);
    } else if (action === 'attack') {
      this.attackPiece(hexId, intermediateMoveHexId);
    } else if (action === 'place') {
      this.placePiece(hexId);
    } else {
      this.setState({selectedHexId: hexId});
      this.props.onSelectTile(hexId, this.props.player);
    }
  }

  onHoverTile(hexId, action) {
    if (action === 'mouseleave') {
      this.props.onHoverTile(null);
    } else {
      const piece = this.allPieces()[hexId];
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

  loadBackground() {
    return inBrowser() ? require('../components/img/black_bg_lodyas.png') : '';
  }

  renderNotification() {
    const options = {
      tag: 'wordbots',
      icon: '/static/android-icon-144x144.png',
      lang: 'en',
      dir: 'ltr',
      timestamp: Math.floor(Date.now())
    };

    if (this.props.currentTurn === this.props.player) {
      return (
        <Notification
          timeout={2000}
          title="Wordbots."
          options={{...options, body: 'It\'s your turn!'}}
          onClick={() => { window.focus(); }} />
      );
    }
  }

  render() {
    return (
      <div>
        <div>
          {this.renderNotification()}
          <Sfx queue={this.props.sfxQueue} />
        </div>
        <Paper
          style={{
            position: 'relative',
            height: this.state.areaHeight,
            background: `url(${this.loadBackground()})`
        }}>
          <PlayerArea opponent gameProps={this.props} />
          <CardViewer hoveredCard={this.hoveredCard()} />
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 75,
              bottom: 75,
              right: 0,
              margin: '0 auto',
              zIndex: 999,
              width: this.state.boardSize
          }}>
            <Status
              player={this.props.player}
              status={this.isMyTurn() ? this.props.status : {}} />
            <Board
              size={this.state.boardSize}
              player={this.props.player}
              currentTurn={this.props.currentTurn}
              selectedTile={this.props.selectedTile}
              target={this.props.target}
              bluePieces={this.props.bluePieces}
              orangePieces={this.props.orangePieces}
              playingCardType={this.props.playingCardType}
              onSelectTile={(hexId, action, intmedMoveHexId) => this.onSelectTile(hexId, action, intmedMoveHexId)}
              onHoverTile={(hexId, action) => this.onHoverTile(hexId, action)} />
          </div>
          <PlayerArea gameProps={this.props} />
          <VictoryScreen
            winnerColor={this.props.winner}
            winnerName={this.props.winner ? this.props.usernames[this.props.winner] : null}
            onClick={this.props.onVictoryScreenClick} />
        </Paper>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameArea));
