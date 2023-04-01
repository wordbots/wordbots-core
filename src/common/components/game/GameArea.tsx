import { Paper, Tab, Tabs } from '@material-ui/core';
import * as React from 'react';
import Helmet from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import * as screenfull from 'screenfull';

import {
  CHAT_COLLAPSED_WIDTH, CHAT_NARROW_WIDTH,
  CHAT_WIDTH, HEADER_HEIGHT, MAX_BOARD_SIZE, SIDEBAR_COLLAPSED_WIDTH
} from '../../constants';
import { urlForGameMode } from '../../containers/Play';
import * as w from '../../types';
import Chat from '../play/Chat';

import CardSelector from './CardSelector';
import FullscreenMessage from './FullscreenMessage';
import GameAreaContents from './GameAreaContents';
import GameNotification from './GameNotification';
import Sfx from './Sfx';
import Status from './Status';

// Props shared by GameArea and GameAreaContainer.
export interface GameProps {
  player: w.PlayerColor | 'neither'
  currentTurn: w.PlayerColor
  usernames: w.PerPlayer<string>
  winner: w.GameWinner
  gameOptions: w.GameOptions
  draft: w.DraftState | null

  selectedTile: w.HexId | null
  selectedCard: number | null
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
  isMyTurnAndNoActionsLeft: boolean
  isSpectator: boolean
  isAttackHappening: boolean
  isWaitingForParse: boolean

  actionLog: w.LoggedAction[]
  collection: w.CollectionState
  socket: w.SocketState
}

export interface GameAreaHandlerProps {
  onPassTurn: (player: w.PlayerColor) => void
  onForfeit: (winner: w.PlayerColor) => void
  onTutorialStep: (back?: boolean) => void
  onSendChatMessage: (msg: string) => void
  onActivateObject: (abilityIdx: number) => void
  onClickGameArea: (evt: React.MouseEvent<HTMLElement>) => void
  onClickEndGame: () => void
  onNextTutorialStep: () => void
  onPrevTutorialStep: () => void
  onSelectCard: (index: number, player: w.PlayerColor) => void
  onSelectCardInDiscardPile: (cardId: w.CardId, player: w.PlayerColor) => void
  onSelectTile: (hexId: w.HexId, action?: 'move' | 'attack' | 'place' | null, intermediateMoveHexId?: w.HexId | null) => void
  onAddCardToHand: (player: w.PlayerColor, card: w.Card) => void
  onDraftCards: (player: w.PlayerColor, cards: w.CardInGame[]) => void
  onSetVolume: (volume: number) => void
}

type GameAreaProps = GameProps & GameAreaHandlerProps & RouteComponentProps & {
  message: string | null
};

interface GameAreaState {
  areaHeight: number
  boardSize: number
  boardMargin: { left: number, top: number }
  chatOpen: boolean
  chatWidth: number
  compactControls: boolean
  startAnimationComplete: boolean
  sidebarMode: 'chat' | 'cardSelector'
}

export default class GameArea extends React.Component<GameAreaProps, GameAreaState> {
  public state: GameAreaState = {
    areaHeight: 1000,
    boardSize: 1000,
    boardMargin: { left: 0, top: 0 },
    chatOpen: true,
    chatWidth: CHAT_WIDTH,
    compactControls: false,
    startAnimationComplete: false, // set to true after the initial 5sec start animation finishes
    sidebarMode: 'cardSelector' // (this property is only read in sandbox mode - other modes have only a chat sidebar)
  };

  public componentWillMount(): void {
    this.calculateDimensions();
    window.addEventListener('resize', this.calculateDimensions);

    // Since the game start animation ("3 - 2 - 1 - start!") is implemented entirely in CSS,
    // we can't really track it directly.
    // But we know it takes 5 sec to complete, so we just have this timeout run in parallel.
    setTimeout(() => {
      this.setState({ startAnimationComplete: true });
    }, 5000);
  }

  get actualPlayer(): w.PlayerColor | null {
    // In sandbox mode, the "actual player" is whoever's turn it is,
    // because the "player" can move either side's pieces.
    const { currentTurn, isSandbox, isSpectator, player } = this.props;
    return isSpectator ? null : (isSandbox ? currentTurn : player as w.PlayerColor);
  }

  public render(): JSX.Element {
    const {
      currentTurn, isMyTurn, isSandbox, message, player, sfxQueue, status, volume, onClickGameArea
    } = this.props;
    const { areaHeight, boardSize, boardMargin, chatOpen, chatWidth, compactControls, startAnimationComplete } = this.state;

    if (message) {
      return <FullscreenMessage message={message} height={areaHeight} />;
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
          <Helmet title="Arena" />
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
            background: 'url(/static/black_bg_lodyas.png)'
          }}
          onClick={onClickGameArea}
          square
        >
          <GameAreaContents
            {...this.props}
            actualPlayer={this.actualPlayer}
            boardSize={boardSize}
            boardMargin={boardMargin}
            chatOpen={chatOpen}
            compactControls={compactControls}
            startAnimationComplete={startAnimationComplete}
            onToggleFullscreen={this.handleToggleFullScreen}
          />
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

  private handleSelectSidebarTab = (_evt: React.ChangeEvent<unknown>, value: string) => {
    this.setState({ sidebarMode: value as 'chat' | 'cardSelector' });
  }

  private calculateDimensions = () => {
    const compactControls: boolean = window.innerWidth < 1200;
    const navSidebarWidth = this.urlMatchesGameMode('sandbox') ? SIDEBAR_COLLAPSED_WIDTH : 0;

    const topBottomMargin = 80;
    const leftRightMargin = 200;

    this.setState(({ chatOpen }) => {
      const chatWidth = !chatOpen ? CHAT_COLLAPSED_WIDTH : (compactControls ? CHAT_NARROW_WIDTH : CHAT_WIDTH);

      const areaHeight = window.innerHeight - HEADER_HEIGHT;
      const areaWidth = window.innerWidth - chatWidth - navSidebarWidth;

      const maxBoardHeight = areaHeight - topBottomMargin * 2;
      const maxBoardWidth = areaWidth - (2 * leftRightMargin);
      const boardSize = Math.min(maxBoardWidth, maxBoardHeight, MAX_BOARD_SIZE);

      return {
        areaHeight,
        boardSize,
        boardMargin: {
          // On a large enough screen (areaWidth > 1300), center the board in the exact middle of the game area.
          // On smaller screens (areaWidth < 1300), position the board halfway between the controls on the left and right sides.
          // (This moves the board closer to the left because the left controls (volume, &c) are much narrower than the right (End Turn, &c))
          left: areaWidth > 1300 ? (areaWidth - boardSize) / 2 : leftRightMargin + (maxBoardWidth - boardSize) / 2,
          top: topBottomMargin + (maxBoardHeight - boardSize) / 2
        },
        compactControls,
        chatWidth
      };
    });
  }

  private renderSidebar = () => {
    const { actionLog, collection, isSandbox, socket, onAddCardToHand, onSendChatMessage } = this.props;
    const { chatOpen, compactControls, sidebarMode } = this.state;

    const tabs: JSX.Element | undefined = (
      isSandbox
        ? (
          <Tabs
            variant="fullWidth"
            value={this.state.sidebarMode}
            onChange={this.handleSelectSidebarTab}
            style={{ height: 36, minHeight: 36 }}
          >
            <Tab value="cardSelector" label="Cards" style={{ height: 36, minHeight: 36, minWidth: '50%' }} />
            <Tab value="chat" label="Log" style={{ height: 36, minHeight: 36, minWidth: '50%' }} />
          </Tabs>
        )
        : undefined
    );

    if (isSandbox && sidebarMode === 'cardSelector') {
      return (
        <CardSelector
          cardCollection={collection.cards}
          header={tabs}
          onAddCardToHand={onAddCardToHand}
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
          header={tabs}
          onSendMessage={onSendChatMessage}
        />
      );
    }
  }
}
