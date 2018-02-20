import React, { Component } from 'react';
import { func, object } from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import { ANIMATION_TIME_MS, AI_RESPONSE_TIME_MS } from '../constants';
import { shuffleCardsInDeck } from '../util/cards';
import { currentTutorialStep } from '../util/game';
import GameArea, { gameProps } from '../components/game/GameArea';
import * as gameActions from '../actions/game';
import * as socketActions from '../actions/socket';
import { arbitraryPlayerState } from '../store/defaultGameState';

import Play from './Play';

function animate(fns) {
  if (fns.length > 0) {
    const [first, ...rest] = fns;
    first();
    setTimeout(() => animate(rest), ANIMATION_TIME_MS);
  }
}

export function mapStateToProps(state) {
  const activePlayer = state.game.players[state.game.player] || arbitraryPlayerState();
  const currentPlayer = state.game.players[state.game.currentTurn];

  return {
    started: state.game.started,
    player: state.game.player,
    currentTurn: state.game.currentTurn,
    usernames: state.game.usernames,
    winner: state.game.winner,

    selectedTile: activePlayer.selectedTile,
    selectedCard: activePlayer.selectedCard,
    playingCardType: currentPlayer.selectedCard !== null ? currentPlayer.hand[currentPlayer.selectedCard].type : null,

    status: activePlayer.status,
    target: activePlayer.target,
    attack: state.game.attack,

    blueHand: state.game.players.blue.hand,
    orangeHand: state.game.players.orange.hand,

    bluePieces: state.game.players.blue.robotsOnBoard,
    orangePieces: state.game.players.orange.robotsOnBoard,

    blueEnergy: state.game.players.blue.energy,
    orangeEnergy: state.game.players.orange.energy,

    blueDeck: state.game.players.blue.deck,
    orangeDeck: state.game.players.orange.deck,

    blueDiscardPile: state.game.players.blue.discardPile,
    orangeDiscardPile: state.game.players.orange.discardPile,

    eventQueue: state.game.eventQueue,
    sfxQueue: state.game.sfxQueue,
    tutorialStep: currentTutorialStep(state.game),
    isPractice: state.game.practice,

    gameOver: state.game.winner !== null,
    isTutorial: state.game.tutorial,
    isMyTurn: state.game.currentTurn === state.game.player,
    isAttackHappening: state.game.attack && state.game.attack.from && state.game.attack.to && true,

    actionLog: state.game.actionLog,
    collection: state.collection,
    socket: state.socket
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    onMoveRobot: (fromHexId, toHexId) => {
      dispatch(gameActions.moveRobot(fromHexId, toHexId));
    },
    onAttackRobot: (sourceHexId, targetHexId) => {
      animate([
        () => dispatch(gameActions.attack(sourceHexId, targetHexId)),
        () => dispatch(gameActions.attackRetract()),
        () => dispatch(gameActions.attackComplete())
      ]);
    },
    onMoveRobotAndAttack: (fromHexId, toHexId, targetHexId) => {
      animate([
        () => dispatch(gameActions.moveRobot(fromHexId, toHexId, true)),
        () => dispatch(gameActions.attack(toHexId, targetHexId)),
        () => dispatch(gameActions.attackRetract()),
        () => dispatch(gameActions.attackComplete())
      ]);
    },
    onAttackRetract: () => {
      dispatch(gameActions.attackRetract());
    },
    onAttackComplete: () => {
      dispatch(gameActions.attackComplete());
    },
    onActivateObject: (abilityIdx) => {
      dispatch(gameActions.activateObject(abilityIdx));
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
    onDeselect: (player) => {
      dispatch(gameActions.deselect(player));
    },
    onPassTurn: (player) => {
      dispatch(gameActions.passTurn(player));
    },
    onEndGame: () => {
      dispatch([
        gameActions.endGame(),
        socketActions.leave()
      ]);
    },
    onForfeit: (winner) => {
      dispatch([
        socketActions.forfeit(winner),
        socketActions.leave()
      ]);
    },
    onStartTutorial: () => {
      dispatch(gameActions.startTutorial());
    },
    onTutorialStep: (back) => {
      dispatch(gameActions.tutorialStep(back));
    },
    onStartPractice: (deck) => {
      dispatch(gameActions.startPractice(deck));
    },
    onAIResponse: () => {
      dispatch(gameActions.aiResponse());
    },
    onSendChatMessage: (msg) => {
      dispatch(socketActions.chat(msg));
    }
  };
}

export class GameAreaContainer extends Component {
  /* eslint-disable react/no-unused-prop-types */
  static propTypes = {
    ...gameProps,

    onMoveRobot: func,
    onAttackRobot: func,
    onMoveRobotAndAttack: func,
    onAttackRetract: func,
    onAttackComplete: func,
    onActivateObject: func,
    onPlaceRobot: func,
    onSelectCard: func,
    onSelectTile: func,
    onDeselect: func,
    onPassTurn: func,
    onEndGame: func,
    onForfeit: func,
    onStartTutorial: func,
    onTutorialStep: func,
    onStartPractice: func,
    onAIResponse: func,
    onSendChatMessage: func
  };
  /* eslint-enable react/no-unused-prop-types */

  state = {
    chatOpen: true,
    message: null
  };

  // For testing.
  static childContextTypes = {
    muiTheme: object.isRequired
  };
  getChildContext = () => ({muiTheme: getMuiTheme(baseTheme)})

  componentDidMount() {
    this.tryToStartGame();

    this.interval = setInterval(() => {
      if (this.props.isPractice && !this.props.winner && this.props.currentTurn === 'blue') {
        animate([
          this.props.onAIResponse,
          this.props.onAttackRetract,
          this.props.onAttackComplete
        ]);
      }
    }, AI_RESPONSE_TIME_MS);
  }

  componentDidUpdate(prevProps) {
    if (this.props.collection.firebaseLoaded !== prevProps.collection.firebaseLoaded) {
      this.tryToStartGame();
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
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

  urlMatchesGameMode = mode => this.props.location.pathname.startsWith(Play.urlForGameMode(mode));

  /* Try to start a game (based on the URL) if it hasn't started yet. */
  tryToStartGame = () => {
    const { started, onStartTutorial, history, match } = this.props;

    // If the game hasn't started yet, that means that the player got here
    // by messing with the URL (rather than by clicking a button in the lobby).
    // If the URL is '/play/tutorial' or `/play/practice/:deck`,
    // start the corresponding game mode.
    // Otherwise, just return to the lobby.
    if (!started) {
      if (this.urlMatchesGameMode('tutorial')) {
        onStartTutorial();
      } else if (this.urlMatchesGameMode('practice')) {
        this.tryToStartPracticeGame(match.params.deck);
      } else {
        history.push(Play.baseUrl);
      }
    }
  };

  /* Try to start a practice game from the URL, pending Firebase loading. */
  tryToStartPracticeGame = (deckId) => {
    const { history, onStartPractice, collection: { cards, decks, firebaseLoaded } } = this.props;

    // Decks are stored in Firebase, so we have to wait until
    // we receive data from Firebase before we can try to start a practice game.
    if (firebaseLoaded) {
      const deck = decks.find(d => d.id === deckId);
      if (deck) {
        onStartPractice(shuffleCardsInDeck(deck, cards));
      } else {
        history.push(Play.baseUrl);
      }
    }

    // If we're still waiting on Firebase, render a message.
    this.setState({ message : firebaseLoaded ? null : 'Connecting...' });
  };

  toggleChat = () => {
    this.setState(state => ({ chatOpen: !state.chatOpen }));
  }

  movePiece = (hexId, asPartOfAttack = false) => {
    this.props.onMoveRobot(this.props.selectedTile, hexId, asPartOfAttack);
  }

  attackPiece = (hexId, intermediateMoveHexId) => {
    if (intermediateMoveHexId) {
      this.props.onMoveRobotAndAttack(this.props.selectedTile, intermediateMoveHexId, hexId);
    } else {
      this.props.onAttackRobot(this.props.selectedTile, hexId);
    }
  }

  placePiece = (hexId) => {
    this.props.onPlaceRobot(hexId, this.props.selectedCard);
  }

  onSelectTile = (hexId, action = null, intermediateMoveHexId = null) => {
    if (this.props.attack) {
      return;  // Can't move/attack while an attack is in progress.
    } if (action === 'move') {
      this.movePiece(hexId);
    } else if (action === 'attack') {
      this.attackPiece(hexId, intermediateMoveHexId);
    } else if (action === 'place') {
      this.placePiece(hexId);
    } else {
      this.props.onSelectTile(hexId, this.props.player);
    }
  }

  handleClickGameArea = evt => {
    const { className } = evt.target;
    const { baseVal } = className;
    if ((baseVal !== undefined ? baseVal : className).includes('background')) {
      this.props.onDeselect(this.props.player);
    }
  }

  handleClickEndGame = () => {
    this.props.onEndGame();
    this.props.history.push('/play');
  }

  handleNextTutorialStep = () => {
    this.props.onTutorialStep();
  }

  handlePrevTutorialStep = () => {
    this.props.onTutorialStep(true);
  }

  render = () =>
    <GameArea
      {...this.props}
      {...this.state}

      onPassTurn={this.props.onPassTurn}
      onForfeit={this.props.onForfeit}
      onTutorialStep={this.props.onTutorialStep}
      onSendChatMessage={this.props.onSendChatMessage}
      onActivateObject={this.handleActivateObject}
      onClickGameArea={this.handleClickGameArea}
      onClickEndGame={this.handleClickEndGame}
      onNextTutorialStep={this.handleNextTutorialStep}
      onPrevTutorialStep={this.handlePrevTutorialStep}
      onSelectTile={this.onSelectTile} />;
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameAreaContainer));
