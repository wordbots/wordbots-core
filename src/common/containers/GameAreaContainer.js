import * as React from 'react';
import { func, object } from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import { ANIMATION_TIME_MS, AI_RESPONSE_TIME_MS } from '../constants.ts';
import { animate } from '../util/common.ts';
import { shuffleCardsInDeck } from '../util/cards.ts';
import { currentTutorialStep } from '../util/game.ts';
import GameArea, { gameProps } from '../components/game/GameArea';
import * as gameActions from '../actions/game.ts';
import * as socketActions from '../actions/socket.ts';
import { arbitraryPlayerState } from '../store/defaultGameState.ts';

import Singleplayer from './Singleplayer';

export function mapStateToProps(state) {
  const { game } = state;
  const currentPlayer = game.players[game.currentTurn];
  const activePlayer = game.sandbox ? currentPlayer : game.players[game.player] || arbitraryPlayerState();

  return {
    started: game.started,
    player: game.player,
    currentTurn: game.currentTurn,
    usernames: game.usernames,
    winner: game.winner,
    gameOptions: game.options,

    selectedTile: activePlayer.selectedTile,
    selectedCard: activePlayer.selectedCard,
    playingCardType: currentPlayer.selectedCard !== null ? currentPlayer.hand[currentPlayer.selectedCard].type : null,

    status: activePlayer.status,
    target: activePlayer.target,
    attack: game.attack,

    blueHand: game.players.blue.hand,
    orangeHand: game.players.orange.hand,

    bluePieces: game.players.blue.robotsOnBoard,
    orangePieces: game.players.orange.robotsOnBoard,

    blueEnergy: game.players.blue.energy,
    orangeEnergy: game.players.orange.energy,

    blueDeck: game.players.blue.deck,
    orangeDeck: game.players.orange.deck,

    blueDiscardPile: game.players.blue.discardPile,
    orangeDiscardPile: game.players.orange.discardPile,

    eventQueue: game.eventQueue,
    sfxQueue: game.sfxQueue,
    tutorialStep: currentTutorialStep(game),
    isPractice: game.practice,

    gameOver: game.winner !== null,
    isTutorial: game.tutorial,
    isSandbox: game.sandbox,
    isMyTurn: game.currentTurn === game.player,
    isSpectator: game.player === 'neither',
    isAttackHappening: game.attack && game.attack.from && game.attack.to && true,

    actionLog: game.actionLog,
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
      ], ANIMATION_TIME_MS);
    },
    onMoveRobotAndAttack: (fromHexId, toHexId, targetHexId) => {
      animate([
        () => dispatch(gameActions.moveRobot(fromHexId, toHexId, true)),
        () => dispatch(gameActions.attack(toHexId, targetHexId)),
        () => dispatch(gameActions.attackRetract()),
        () => dispatch(gameActions.attackComplete())
      ], ANIMATION_TIME_MS);
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
    onStartSandbox: () => {
      dispatch(gameActions.startSandbox());
    },
    onTutorialStep: (back) => {
      dispatch(gameActions.tutorialStep(back));
    },
    onStartPractice: (format, deck) => {
      dispatch(gameActions.startPractice(format, deck));
    },
    onAIResponse: () => {
      dispatch(gameActions.aiResponse());
    },
    onSendChatMessage: (msg) => {
      dispatch(socketActions.chat(msg));
    },
    onAddCardToTopOfDeck: (player, card) => {
      dispatch(gameActions.addCardToTopOfDeck(player, card));
    }
  };
}

/* GameAreaContainer handles all dispatch and routing logic for the GameArea component. */
export class GameAreaContainer extends React.Component {
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
    onStartSandbox: func,
    onAIResponse: func,
    onSendChatMessage: func,
    onAddCardToTopOfDeck: func
  };
  /* eslint-enable react/no-unused-prop-types */

  state = {
    message: null
  };

  // For testing.
  static childContextTypes = {
    muiTheme: object.isRequired
  };
  getChildContext = () => ({muiTheme: getMuiTheme(baseTheme)});

  componentDidMount() {
    this.tryToStartGame();
    this.interval = setInterval(this.performAIResponse, AI_RESPONSE_TIME_MS);
  }

  componentDidUpdate(prevProps) {
    if (this.props.collection.firebaseLoaded !== prevProps.collection.firebaseLoaded) {
      this.tryToStartGame();
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  urlMatchesGameMode = mode => this.props.location.pathname.startsWith(Singleplayer.urlForGameMode(mode));

  /* Try to start a game (based on the URL) if it hasn't started yet. */
  tryToStartGame = () => {
    const {
      started,
      isSandbox,
      collection: { firebaseLoaded },
      onStartTutorial,
      onStartSandbox,
      history,
      match
    } = this.props;

    // If the game hasn't started yet*, that means that the player got here
    // by messing with the URL (rather than by clicking a button in the lobby).
    // If the URL is '/play/tutorial' or `/play/practice/:deck`,
    // start the corresponding game mode.
    // Otherwise, just return to the lobby.
    // * If there is a sandbox game happening, restart the game anyway because
    //   most likely the player left a previous sandbox game but isSandbox
    //   is still set to true in the store. (This is possible because sandbox
    //   mode is the only game mode that lets you navigate away without explicitly
    //   ending the game.)
    if (!started || isSandbox) {
      if (this.urlMatchesGameMode('tutorial')) {
        onStartTutorial();
      } else if (firebaseLoaded) {
        // Wait until we retrieve data from Firebase so we can get
        // username and deck list.
        this.setState({ message: null });
        if (this.urlMatchesGameMode('practice')) {
          this.tryToStartPracticeGame(match.params.format, match.params.deck);
        } else if (this.urlMatchesGameMode('sandbox')) {
          onStartSandbox();
        } else {
          history.push(Singleplayer.baseUrl);
        }
      } else {
        // If we're still waiting on Firebase, render a message.
        this.setState({ message: 'Connecting...' });
      }
    }
  };

  /* Try to start a practice game from the URL. */
  tryToStartPracticeGame = (formatName, deckId) => {
    const { history, onStartPractice, collection: { cards, decks } } = this.props;
    const deck = decks.find(d => d.id === deckId);

    if (deck) {
      onStartPractice(formatName, shuffleCardsInDeck(deck, cards));
    } else {
      history.push(Singleplayer.baseUrl);
    }
  };

  performAIResponse = () => {
    const { currentTurn, isPractice, winner, onAIResponse, onAttackRetract, onAttackComplete } = this.props;
    if (isPractice && !winner && currentTurn === 'blue') {
      animate([
        onAIResponse,
        onAttackRetract,
        onAttackComplete
      ], ANIMATION_TIME_MS);
    }
  }

  movePiece = (hexId) => {
    this.props.onMoveRobot(this.props.selectedTile, hexId);
  };

  attackPiece = (hexId, intermediateMoveHexId) => {
    if (intermediateMoveHexId) {
      this.props.onMoveRobotAndAttack(this.props.selectedTile, intermediateMoveHexId, hexId);
    } else {
      this.props.onAttackRobot(this.props.selectedTile, hexId);
    }
  };

  placePiece = (hexId) => {
    this.props.onPlaceRobot(hexId, this.props.selectedCard);
  };

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
      this.props.onSelectTile(hexId, this.props.isSandbox ? this.props.currentTurn : this.props.player);
    }
  };

  handleClickGameArea = evt => {
    const { className } = evt.target;
    const { baseVal } = className;
    if ((baseVal !== undefined ? baseVal : className).includes('background')) {
      this.props.onDeselect(this.props.player);
    }
  };

  handleClickEndGame = () => {
    const { history, onEndGame } = this.props;
    onEndGame();
    // We can't just do history.goBack() because we may have gotten here
    // from outside of Wordbots and we don't want to leave the site.
    if (history.location.state && history.location.state.previous) {
      history.push(history.location.state.previous.pathname);
    } else {
      history.push('/play');
    }
  };

  handleNextTutorialStep = () => {
    this.props.onTutorialStep();
  };

  handlePrevTutorialStep = () => {
    this.props.onTutorialStep(true);
  };

  render = () =>
    <GameArea
      {...this.props}
      message={this.state.message}
      onPassTurn={this.props.onPassTurn}
      onForfeit={this.props.onForfeit}
      onTutorialStep={this.props.onTutorialStep}
      onSendChatMessage={this.props.onSendChatMessage}
      onActivateObject={this.props.onActivateObject}
      onClickGameArea={this.handleClickGameArea}
      onClickEndGame={this.handleClickEndGame}
      onNextTutorialStep={this.handleNextTutorialStep}
      onPrevTutorialStep={this.handlePrevTutorialStep}
      onSelectTile={this.onSelectTile}
      onAddCardToTopOfDeck={this.props.onAddCardToTopOfDeck} />;
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameAreaContainer));
