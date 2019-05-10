import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { object } from 'prop-types';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Dispatch } from 'redux';

import * as gameActions from '../actions/game';
import * as socketActions from '../actions/socket';
import GameArea, { GameProps } from '../components/game/GameArea';
import { AI_RESPONSE_TIME_MS, ANIMATION_TIME_MS } from '../constants';
import { isCardVisible } from '../guards';
import { arbitraryPlayerState } from '../store/defaultGameState';
import * as w from '../types';
import { shuffleCardsInDeck } from '../util/cards';
import { animate } from '../util/common';
import { currentTutorialStep } from '../util/game';

import { baseGameUrl, urlForGameMode } from './Play';

type GameAreaStateProps = GameProps & {
  selectedCard: any
  started: boolean
};

interface GameAreaDispatchProps {
  onMoveRobot: (fromHexId: w.HexId, toHexId: w.HexId) => void
  onAttackRobot: (sourceHexId: w.HexId, targetHexId: w.HexId) => void
  onMoveRobotAndAttack: (fromHexId: w.HexId, toHexId: w.HexId, targetHexId: w.HexId) => void
  onAttackRetract: () => void
  onAttackComplete: () => void
  onActivateObject: (abilityIdx: number) => void
  onPlaceRobot: (tileHexId: w.HexId, cardIdx: number) => void
  onSelectCard: (index: number, player: w.PlayerColor) => void
  onSelectTile: (hexId: w.HexId, player: w.PlayerColor) => void
  onDeselect: (player: w.PlayerColor) => void
  onPassTurn: (player: w.PlayerColor) => void
  onEndGame: () => void
  onForfeit: (winner: w.PlayerColor) => void
  onStartTutorial: () => void
  onStartSandbox: () => void
  onTutorialStep: (back?: boolean) => void
  onStartPractice: (format: w.BuiltInFormat, deck: w.CardInStore[]) => void
  onAIResponse: () => void
  onSendChatMessage: (msg: string) => void
  onAddCardToTopOfDeck: (player: w.PlayerColor, card: w.Card) => void
  onSetVolume: (volume: number) => void
}

export type GameAreaContainerProps = GameAreaStateProps & GameAreaDispatchProps & RouteComponentProps;

interface GameAreaContainerState {
  interval?: NodeJS.Timeout,
  message: string | null
}

export function mapStateToProps(state: w.State): GameAreaStateProps {
  const { game } = state;

  const currentPlayer = game.players[game.currentTurn];
  const activePlayer: w.PlayerInGameState = (
    game.sandbox
      ? currentPlayer
      : (game.player !== 'neither' && game.players[game.player] || arbitraryPlayerState())
  );
  const currentPlayerSelectedCard: w.PossiblyObfuscatedCard | null = currentPlayer.selectedCard !== null ? currentPlayer.hand[currentPlayer.selectedCard] : null;

  return {
    started: game.started,
    player: game.player,
    currentTurn: game.currentTurn,
    usernames: game.usernames,
    winner: game.winner,
    gameOptions: game.options,

    selectedTile: activePlayer.selectedTile,
    selectedCard: activePlayer.selectedCard,
    playingCardType: currentPlayerSelectedCard && isCardVisible(currentPlayerSelectedCard) ? currentPlayerSelectedCard.type : null,

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
    volume: game.volume,

    gameOver: game.winner !== null,
    isTutorial: game.tutorial,
    isSandbox: game.sandbox,
    isMyTurn: game.currentTurn === game.player,
    isSpectator: game.player === 'neither',
    isAttackHappening: !!game.attack && !!game.attack.from && !!game.attack.to,

    actionLog: game.actionLog,
    collection: state.collection,
    socket: state.socket
  };
}

export function mapDispatchToProps(dispatch: Dispatch<any>): GameAreaDispatchProps {
  return {
    onMoveRobot: (fromHexId: w.HexId, toHexId: w.HexId) => {
      dispatch(gameActions.moveRobot(fromHexId, toHexId));
    },
    onAttackRobot: (sourceHexId: w.HexId, targetHexId: w.HexId) => {
      animate([
        () => dispatch(gameActions.attack(sourceHexId, targetHexId)),
        () => dispatch(gameActions.attackRetract()),
        () => dispatch(gameActions.attackComplete())
      ], ANIMATION_TIME_MS);
    },
    onMoveRobotAndAttack: (fromHexId: w.HexId, toHexId: w.HexId, targetHexId: w.HexId) => {
      animate([
        () => dispatch(gameActions.moveRobot(fromHexId, toHexId)),
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
    onActivateObject: (abilityIdx: number) => {
      dispatch(gameActions.activateObject(abilityIdx));
    },
    onPlaceRobot: (tileHexId: w.HexId, cardIdx: number) => {
      dispatch(gameActions.placeCard(tileHexId, cardIdx));
    },
    onSelectCard: (index: number, player: w.PlayerColor) => {
      dispatch(gameActions.setSelectedCard(index, player));
    },
    onSelectTile: (hexId: w.HexId, player: w.PlayerColor) => {
      dispatch(gameActions.setSelectedTile(hexId, player));
    },
    onDeselect: (player: w.PlayerColor) => {
      dispatch(gameActions.deselect(player));
    },
    onPassTurn: (player: w.PlayerColor) => {
      dispatch(gameActions.passTurn(player));
    },
    onEndGame: () => {
      dispatch([
        gameActions.endGame(),
        socketActions.leave()
      ]);
    },
    onForfeit: (winner: w.PlayerColor) => {
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
    onTutorialStep: (back?: boolean) => {
      dispatch(gameActions.tutorialStep(back));
    },
    onStartPractice: (format: w.BuiltInFormat, deck: w.CardInStore[]) => {
      dispatch(gameActions.startPractice(format, deck));
    },
    onAIResponse: () => {
      dispatch(gameActions.aiResponse());
    },
    onSendChatMessage: (msg: string) => {
      dispatch(socketActions.chat(msg));
    },
    onAddCardToTopOfDeck: (player: w.PlayerColor, card: w.Card) => {
      dispatch(gameActions.addCardToTopOfDeck(player, card));
    },
    onSetVolume: (volume: number) => {
      dispatch(gameActions.setVolume(volume));
    }
  };
}

// GameAreaContainer handles all dispatch and routing logic for the GameArea component.
export class GameAreaContainer extends React.Component<GameAreaContainerProps, GameAreaContainerState> {
  // For testing.
  public static childContextTypes = {
    muiTheme: object.isRequired
  };

  constructor(props: GameAreaContainerProps) {
    super(props);
    this.state = {
      interval: setInterval(this.performAIResponse, AI_RESPONSE_TIME_MS),
      message: null
    };
  }

  // For testing.
  public getChildContext = () => ({muiTheme: getMuiTheme(baseTheme)});

  public componentDidMount(): void {
    this.tryToStartGame();
  }

  public componentDidUpdate(prevProps: GameAreaContainerProps): void {
    if (this.props.collection.firebaseLoaded !== prevProps.collection.firebaseLoaded) {
      this.tryToStartGame();
    }
  }

  public componentWillUnmount(): void {
    const { onEndGame } = this.props;
    const { interval } = this.state;

    onEndGame();
    if (interval) {
      clearInterval(interval);
    }
  }

  public render(): JSX.Element {
    return (
      <GameArea
        {...this.props}
        message={this.state.message}
        onClickGameArea={this.handleClickGameArea}
        onClickEndGame={this.handleClickEndGame}
        onNextTutorialStep={this.handleNextTutorialStep}
        onPrevTutorialStep={this.handlePrevTutorialStep}
        onSelectTile={this.onSelectTile}
      />
    );
  }

  private urlMatchesGameMode = (mode: string) => this.props.location.pathname.startsWith(urlForGameMode(mode));

  // Try to start a game (based on the URL) if it hasn't started yet.
  private tryToStartGame = () => {
    const {
      started,
      isSandbox,
      collection: { firebaseLoaded },
      onStartTutorial,
      onStartSandbox,
      history,
      match
    } = this.props;
    const params = (match ? match.params : {}) as Record<string, string | undefined>;

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
        if (this.urlMatchesGameMode('practice') && params.format && params.deck) {
          this.tryToStartPracticeGame(params.format as w.BuiltInFormat, params.deck);
        } else if (this.urlMatchesGameMode('sandbox')) {
          onStartSandbox();
        } else {
          history.push(baseGameUrl);
        }
      } else {
        // If we're still waiting on Firebase, render a message.
        this.setState({ message: 'Connecting...' });
      }
    }
  }

  // Try to start a practice game from the URL.
  private tryToStartPracticeGame = (formatName: w.BuiltInFormat, deckId: w.DeckId) => {
    const { history, onStartPractice, collection: { cards, decks, sets } } = this.props;
    const deck = decks.find((d) => d.id === deckId);

    if (deck) {
      onStartPractice(formatName, shuffleCardsInDeck(deck, cards, sets));
    } else {
      history.push(baseGameUrl);
    }
  }

  private performAIResponse = () => {
    const { currentTurn, isPractice, winner, onAIResponse, onAttackRetract, onAttackComplete } = this.props;
    if (isPractice && !winner && currentTurn === 'blue') {
      animate([
        onAIResponse,
        onAttackRetract,
        onAttackComplete
      ], ANIMATION_TIME_MS);
    }
  }

  private movePiece = (hexId: w.HexId) => {
    const { selectedTile, onMoveRobot } = this.props;
    if (selectedTile) {
      onMoveRobot(selectedTile, hexId);
    }
  }

  private attackPiece = (hexId: w.HexId, intermediateMoveHexId: w.HexId | null) => {
    const { selectedTile, onAttackRobot, onMoveRobotAndAttack } = this.props;

    if (!selectedTile) {
      return;
    }

    if (intermediateMoveHexId) {
      onMoveRobotAndAttack(selectedTile, intermediateMoveHexId, hexId);
    } else {
      onAttackRobot(selectedTile, hexId);
    }
  }

  private placePiece = (hexId: w.HexId) => {
    this.props.onPlaceRobot(hexId, this.props.selectedCard);
  }

  private onSelectTile = (hexId: w.HexId, action: 'move' | 'attack' | 'place' | null = null, intermediateMoveHexId: w.HexId | null = null) => {
    const { attack, currentTurn, isSandbox, player, onSelectTile } = this.props;

    if (player === 'neither') {
      return;  // Spectators can't select tiles.
    } else if (attack) {
      return;  // Can't move/attack while an attack is in progress.
    } else if (action === 'move') {
      this.movePiece(hexId);
    } else if (action === 'attack') {
      this.attackPiece(hexId, intermediateMoveHexId);
    } else if (action === 'place') {
      this.placePiece(hexId);
    } else {
      onSelectTile(hexId, isSandbox ? currentTurn : player);
    }
  }

  private handleClickGameArea = (evt: React.MouseEvent<HTMLElement>) => {
    const { player, onDeselect } = this.props;
    const { className } = evt.target as any;

    // Not sure why this is necessary ...
    const { baseVal } = className;
    const actualClassName = baseVal !== undefined ? baseVal : className;

    if (player !== 'neither' && actualClassName.includes('background')) {
      onDeselect(player);
    }
  }

  private handleClickEndGame = () => {
    const { history, onEndGame } = this.props;
    onEndGame();
    // We can't just do history.goBack() because we may have gotten here
    // from outside of Wordbots and we don't want to leave the site.
    if (history.location.state && history.location.state.previous) {
      history.push(history.location.state.previous.pathname);
    } else {
      history.push('/play');
    }
  }

  private handleNextTutorialStep = () => {
    this.props.onTutorialStep();
  }

  private handlePrevTutorialStep = () => {
    this.props.onTutorialStep(true);
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameAreaContainer));
