import Paper from '@material-ui/core/Paper';
import * as React from 'react';
import Helmet from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import * as screenfull from 'screenfull';

import {
  BACKGROUND_Z_INDEX, BOARD_Z_INDEX, CHAT_COLLAPSED_WIDTH, CHAT_NARROW_WIDTH,
  CHAT_WIDTH, HEADER_HEIGHT, MAX_BOARD_SIZE, SIDEBAR_COLLAPSED_WIDTH
} from '../../constants';
import { GameAreaContainerProps } from '../../containers/GameAreaContainer';
import { urlForGameMode } from '../../containers/Play';
import * as w from '../../types';
import { inBrowser } from '../../util/browser';
import Chat from '../play/Chat';

import Board from './Board';
import CardSelector from './CardSelector';
import EndTurnButton from './EndTurnButton';
import EventAnimation from './EventAnimation';
import ForfeitButton from './ForfeitButton';
import FullscreenMessage from './FullscreenMessage';
import FullscreenToggle from './FullscreenToggle';
import GameNotification from './GameNotification';
import PlayerArea from './PlayerArea';
import Sfx from './Sfx';
import SoundToggle from './SoundToggle';
import Status from './Status';
import Timer from './Timer';
import TutorialIntroScreen from './TutorialIntroScreen';
import VictoryScreen from './VictoryScreen';

// Props shared by GameArea and GameAreaContainer.
export interface GameProps {
  player: w.PlayerColor | 'neither'
  currentTurn: w.PlayerColor
  usernames: w.PerPlayer<string>
  winner: w.GameWinner
  gameOptions: w.GameOptions

  selectedTile: w.HexId | null
  playingCardType: w.CardType | null

  status: w.PlayerStatus
  target: w.CurrentTarget
  attack: w.Attack | null

  blueHand: w.PossiblyObfuscatedCard[]
  orangeHand: w.PossiblyObfuscatedCard[]

  bluePieces: Record<string, w.Object>
  orangePieces: Record<string, w.Object>

  blueEnergy: w.PlayerEnergy
  orangeEnergy: w.PlayerEnergy

  blueDeck: w.PossiblyObfuscatedCard[]
  orangeDeck: w.PossiblyObfuscatedCard[]

  blueDiscardPile: w.PossiblyObfuscatedCard[]
  orangeDiscardPile: w.PossiblyObfuscatedCard[]

  eventQueue: w.CardInGame[]
  sfxQueue: string[]
  tutorialStep?: w.TutorialStep
  volume: number

  gameOver: boolean
  isTutorial: boolean
  isPractice: boolean
  isSandbox: boolean
  isMyTurn: boolean
  isSpectator: boolean
  isAttackHappening: boolean

  actionLog: w.LoggedAction[]
  collection: w.CollectionState
  socket: w.SocketState
}

type GameAreaProps = GameProps & RouteComponentProps & {
  message: string | null
  onPassTurn: (player: w.PlayerColor) => void
  onForfeit: (winner: w.PlayerColor) => void
  onTutorialStep: (back?: boolean) => void
  onSendChatMessage: (msg: string) => void
  onActivateObject: (abilityIdx: number) => void
  onClickGameArea: (evt: React.MouseEvent<HTMLElement>) => void
  onClickEndGame: () => void
  onNextTutorialStep: () => void
  onPrevTutorialStep: () => void
  onSelectTile: (hexId: w.HexId, action?: 'move' | 'attack' | 'place' | null, intermediateMoveHexId?: w.HexId | null) => void
  onaddCardToHand: (player: w.PlayerColor, card: w.Card) => void
  onSetVolume: (volume: number) => void
};

interface GameAreaState {
  areaHeight: number
  boardSize: number
  boardMargin: { left: number, top: number }
  chatOpen: boolean
  chatWidth: number
  compactControls: boolean
}

export default class GameArea extends React.Component<GameAreaProps, GameAreaState> {
  public state = {
    areaHeight: 1000,
    boardSize: 1000,
    boardMargin: { left: 0, top: 0 },
    chatOpen: true,
    chatWidth: CHAT_WIDTH,
    compactControls: false
  };

  public componentWillMount(): void {
    this.calculateDimensions();
    window.addEventListener('resize', this.calculateDimensions);
  }

  get actualPlayer(): w.PlayerColor | null {
    // In sandbox mode, the "actual player" is whoever's turn it is,
    // because the "player" can move either side's pieces.
    const { currentTurn, isSandbox, isSpectator, player } = this.props;
    return isSpectator ? null : (isSandbox ? currentTurn : player as w.PlayerColor);
  }

  public render(): JSX.Element {
    const {
      attack, bluePieces, currentTurn, eventQueue, gameOptions, gameOver, history, isAttackHappening,
      isMyTurn, isPractice, isSandbox, isSpectator, isTutorial, message, orangePieces, player, playingCardType,
      selectedTile, sfxQueue, status, target, tutorialStep, usernames, winner, volume,
      onActivateObject, onClickEndGame, onClickGameArea, onForfeit, onNextTutorialStep,
      onPassTurn, onPrevTutorialStep, onSelectTile, onTutorialStep, onSetVolume
    } = this.props;
    const { areaHeight, boardSize, boardMargin, chatOpen, chatWidth, compactControls } = this.state;

    if (message) {
      return <FullscreenMessage message={message} height={areaHeight} background={this.loadBackground()} />;
    }

    return (
      <div
        id="gameArea"
        ref={(gameArea) => { (this as any).gameArea = gameArea; /* TODO more type-safe ref handling */ }}
        style={{
          width: screenfull.isFullscreen ? '100%' : 'auto',
          height: screenfull.isFullscreen ? this.state.areaHeight + HEADER_HEIGHT : this.state.areaHeight,
          display: this.props.isSandbox ? 'flex' : 'block'
        }}
      >
        <div>
          <Helmet title="Play" />
          <GameNotification text="It's your turn!" enabled={currentTurn === player} />
          <Sfx queue={sfxQueue} volume={volume} />
          {(isMyTurn || isSandbox) && <Status type={status.type} message={status.message} />}
        </div>

        <Paper
          className="background"
          style={{
            position: 'relative',
            marginRight: this.props.isSandbox ? 0 : (chatOpen ? chatWidth : CHAT_COLLAPSED_WIDTH),
            width: this.props.isSandbox ? `calc(100% - ${chatOpen ? chatWidth : CHAT_COLLAPSED_WIDTH}px)` : 'auto',
            height: screenfull.isFullscreen ? areaHeight + HEADER_HEIGHT : areaHeight,
            background: `url(${this.loadBackground()})`
          }}
          onClick={onClickGameArea}
          square
        >
          <div
            className="background"
            style={{
              display: 'flex',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div
              className="background"
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 20,
                zIndex: BACKGROUND_Z_INDEX
              }}
            >
              <Timer
                player={player}
                currentTurn={currentTurn}
                enabled={!gameOver && !isTutorial && !isPractice && !isSandbox && !gameOptions.disableTurnTimer}
                isMyTurn={isMyTurn}
                isAttackHappening={isAttackHappening}
                onPassTurn={onPassTurn}
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-around',
                  paddingLeft: 10
                }}
              >
                <SoundToggle onSetVolume={onSetVolume} volume={volume} />
                <FullscreenToggle onClick={this.handleToggleFullScreen} />
              </div>
            </div>
            <div
              className="background"
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginRight: 20,
                zIndex: BACKGROUND_Z_INDEX
              }}
            >
              <EndTurnButton
                player={this.actualPlayer}
                compact={compactControls}
                gameOver={gameOver}
                isMyTurn={isMyTurn || isSandbox}
                isAttackHappening={isAttackHappening}
                tutorialStep={tutorialStep}
                onPassTurn={onPassTurn}
                onNextTutorialStep={onNextTutorialStep}
                onPrevTutorialStep={onPrevTutorialStep}
              />
              <ForfeitButton
                player={this.actualPlayer}
                compact={compactControls}
                history={history}
                gameOver={gameOver}
                isSpectator={isSpectator}
                isTutorial={isTutorial}
                onForfeit={isSandbox ? onClickEndGame : onForfeit}
              />
            </div>
          </div>
          <PlayerArea opponent gameProps={this.props as any as GameAreaContainerProps} />
          <div
            className="background"
            style={{
              position: 'absolute',
              left: boardMargin.left,
              top: boardMargin.top,
              margin: 0,
              zIndex: BOARD_Z_INDEX,
              width: boardSize,
              height: boardSize
              // border: '5px solid white'  /* (useful for debugging layout) */
            }}
          >
            <Board
              size={this.state.boardSize}
              player={this.actualPlayer}
              currentTurn={currentTurn}
              selectedTile={selectedTile}
              target={target}
              bluePieces={bluePieces}
              orangePieces={orangePieces}
              playingCardType={playingCardType}
              tutorialStep={tutorialStep}
              attack={attack}
              isGameOver={!!winner}
              onSelectTile={onSelectTile}
              onActivateAbility={onActivateObject}
              onTutorialStep={onTutorialStep}
              onEndGame={onClickEndGame}
            />
          </div>
          <PlayerArea gameProps={this.props as any as GameAreaContainerProps} />
          <EventAnimation eventQueue={eventQueue} currentTurn={currentTurn} />
          <VictoryScreen
            winner={winner}
            winnerName={(winner && winner !== 'draw') ? usernames[winner] : null}
            onClick={onClickEndGame}
          />
          {tutorialStep && tutorialStep.idx === 0 && <TutorialIntroScreen onClickEndGame={onClickEndGame} />}
        </Paper>

        {this.renderSidebar()}
      </div>
    );
  }

  private urlMatchesGameMode = (mode: string) => {
    const { location } = this.props;
    return location?.pathname.startsWith(urlForGameMode(mode));
  }

  private handleToggleFullScreen = () => {
    screenfull.toggle((this as any).gameArea);
  }

  private handleToggleChat = () => {
    this.setState((state) => ({ chatOpen: !state.chatOpen }), this.calculateDimensions);
  }

  private loadBackground = () => inBrowser() ? require('../img/black_bg_lodyas.png') : '';

  private calculateDimensions = () => {
    const compactControls: boolean = window.innerWidth < 1200;
    const navSidebarWidth = this.urlMatchesGameMode('sandbox') ? SIDEBAR_COLLAPSED_WIDTH : 0;

    const topBottomMargin = 80;
    const leftMargin = 80;
    const rightMargin = compactControls ? 270 : 310;

    this.setState(({ chatOpen }) => {
      const chatWidth = !chatOpen ? CHAT_COLLAPSED_WIDTH : (compactControls ? CHAT_NARROW_WIDTH : CHAT_WIDTH);

      const areaHeight = window.innerHeight - HEADER_HEIGHT;
      const areaWidth = window.innerWidth - chatWidth - navSidebarWidth;

      const maxBoardHeight = areaHeight - topBottomMargin * 2;
      const maxBoardWidth = areaWidth - leftMargin - rightMargin;
      const boardSize = Math.min(maxBoardWidth, maxBoardHeight, MAX_BOARD_SIZE);

      return {
        areaHeight,
        boardSize,
        boardMargin: {
          // On a large enough screen (areaWidth > 1300), center the board in the exact middle of the game area.
          // On smaller screens (areaWidth < 1300), position the board halfway between the controls on the left and right sides.
          // (This moves the board closer to the left because the left controls (volume, &c) are much narrower than the right (End Turn, &c))
          left: areaWidth > 1300 ? (areaWidth - boardSize) / 2 : leftMargin + (maxBoardWidth - boardSize) / 2,
          top: topBottomMargin + (maxBoardHeight - boardSize) / 2
        },
        compactControls,
        chatWidth
      };
    });
  }

  private renderSidebar = () => {
    const { actionLog, collection, isSandbox, socket, onaddCardToHand, onSendChatMessage } = this.props;
    const { chatOpen, compactControls } = this.state;

    if (isSandbox) {
      return (
        <CardSelector
          cardCollection={collection.cards}
          onaddCardToHand={onaddCardToHand}
        />
      );
    } else {
      return (
        <Chat
          inGame
          fullscreen={screenfull.isFullscreen}
          open={chatOpen}
          compact={compactControls}
          toggleChat={this.handleToggleChat}
          roomName={socket.hosting ? null : socket.gameName}
          messages={socket.chatMessages.concat(actionLog)}
          onSendMessage={onSendChatMessage}
        />
      );
    }
  }
}
