import React, { Component } from 'react';
import { arrayOf, bool, func, number, object, string } from 'prop-types';
import Paper from 'material-ui/Paper';
import Helmet from 'react-helmet';
import screenfull from 'screenfull';

import {
  HEADER_HEIGHT, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH, BOARD_Z_INDEX, BACKGROUND_Z_INDEX
} from '../../constants';
import { inBrowser } from '../../util/browser';
import Chat from '../multiplayer/Chat';

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
import VictoryScreen from './VictoryScreen';

/* Props shared by GameArea and GameAreaContainer. */
export const gameProps = {
  player: string,
  currentTurn: string,
  usernames: object,
  winner: string,

  selectedTile: string,
  playingCardType: number,

  status: object,
  target: object,
  attack: object,

  blueHand: arrayOf(object),
  orangeHand: arrayOf(object),

  bluePieces: object,
  orangePieces: object,

  blueEnergy: object,
  orangeEnergy: object,

  blueDeck: arrayOf(object),
  orangeDeck: arrayOf(object),

  blueDiscardPile: arrayOf(object),
  orangeDiscardPile: arrayOf(object),

  eventQueue: arrayOf(object),
  sfxQueue: arrayOf(string),
  tutorialStep: object,

  history: object,
  location: object,
  match: object,

  gameOver: bool,
  isTutorial: bool,
  isSandbox: bool,
  isMyTurn: bool,
  isSpectator: bool,
  isAttackHappening: bool,

  actionLog: arrayOf(object),
  socket: object
};

export default class GameArea extends Component {
  /* eslint-disable react/no-unused-prop-types */
  static propTypes = {
    ...gameProps,
    message: string,

    onPassTurn: func,
    onForfeit: func,
    onTutorialStep: func,
    onSendChatMessage: func,
    onActivateObject: func,
    onClickGameArea: func,
    onClickEndGame: func,
    onNextTutorialStep: func,
    onPrevTutorialStep: func,
    onSelectTile: func,
    onAddCardToTopOfDeck: func
  };
  /* eslint-enable react/no-unused-prop-types */

  state = {
    areaHeight: 1250,
    boardSize: 1000,
    chatOpen: true
  };

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener('resize', () => { this.updateDimensions(); });
  }

  get actualPlayer() {
    // In sandbox mode, the "actual player" is whoever's turn it is,
    // because the "player" can move either side's pieces.
    const { currentTurn, isSandbox, player } = this.props;
    return isSandbox ? currentTurn : player;
  }

  handleToggleFullScreen = () => {
    screenfull.toggle(this.gameArea);
  };

  handleToggleChat = () => {
    this.setState(state => ({ chatOpen: !state.chatOpen }));
  };

  loadBackground = () => inBrowser() ? require('../img/black_bg_lodyas.png') : '';

  updateDimensions = () => {
    const maxBoardHeight = window.innerHeight - HEADER_HEIGHT - 150;
    const maxBoardWidth = window.innerWidth - SIDEBAR_WIDTH;

    this.setState({
      areaHeight: window.innerHeight - HEADER_HEIGHT,
      boardSize: Math.min(maxBoardWidth, maxBoardHeight)
    });
  };

  renderSidebar = () => {
    const { actionLog, collection, isSandbox, socket, onAddCardToTopOfDeck, onSendChatMessage } = this.props;
    const { chatOpen } = this.state;

    if (isSandbox) {
      return (
        <CardSelector
          cardCollection={collection.cards}
          onAddCardToTopOfDeck={onAddCardToTopOfDeck} />
      );
    } else {
      return (
        <Chat
          inGame
          fullscreen={screenfull.isFullscreen}
          open={chatOpen}
          toggleChat={this.handleToggleChat}
          roomName={socket.hosting ? null : socket.gameName}
          messages={socket.chatMessages.concat(actionLog)}
          onSendMessage={onSendChatMessage} />
      );
    }
  }

  render() {
    const {
      attack, bluePieces, currentTurn, eventQueue, gameOver, history, isAttackHappening,
      isMyTurn, isSandbox, isSpectator, isTutorial, message, orangePieces, player, playingCardType,
      selectedTile, sfxQueue, status, target, tutorialStep, usernames, winner,
      onActivateObject, onClickEndGame, onClickGameArea, onForfeit, onNextTutorialStep,
      onPassTurn, onPrevTutorialStep, onSelectTile, onTutorialStep
    } = this.props;
    const { areaHeight, boardSize } = this.state;

    if (message) {
      return <FullscreenMessage message={message} height={areaHeight} background={this.loadBackground()} />;
    }

    return (
      <div
        id="gameArea"
        ref={(gameArea) => { this.gameArea = gameArea; }}
        style={{
          width: screenfull.isFullscreen ? '100%' : 'auto',
          height: screenfull.isFullscreen ? this.state.areaHeight + HEADER_HEIGHT : this.state.areaHeight,
          display: this.props.isSandbox ? 'flex' : 'block'
        }}
      >
        <div>
          <Helmet title="Play" />
          <GameNotification text="It's your turn!" enabled={currentTurn === player} />
          <Sfx queue={sfxQueue} />
        </div>

        <Paper
          className="background"
          style={{
            position: 'relative',
            marginRight: this.props.isSandbox ? 0 : (this.state.chatOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH),
            width: this.props.isSandbox ? `calc(100% - ${SIDEBAR_WIDTH}px)` : 'auto',
            height: screenfull.isFullscreen ? areaHeight + HEADER_HEIGHT : areaHeight,
            background: `url(${this.loadBackground()})`
          }}
          onClick={onClickGameArea}
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
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 20,
                zIndex: BACKGROUND_Z_INDEX
              }}
            >
              <Timer
                player={player}
                currentTurn={currentTurn}
                gameOver={gameOver}
                isTutorial={isTutorial || isSandbox}
                isMyTurn={isMyTurn}
                isAttackHappening={isAttackHappening}
                onPassTurn={onPassTurn} />
              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                marginTop: 10
              }}>
                <SoundToggle />
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
                gameOver={gameOver}
                isMyTurn={isMyTurn || isSandbox}
                isAttackHappening={isAttackHappening}
                tutorialStep={tutorialStep}
                onPassTurn={onPassTurn}
                onNextTutorialStep={onNextTutorialStep}
                onPrevTutorialStep={onPrevTutorialStep} />
              <ForfeitButton
                player={this.actualPlayer}
                history={history}
                gameOver={gameOver}
                isSpectator={isSpectator}
                isTutorial={isTutorial}
                onForfeit={onForfeit} />
            </div>
          </div>
          <PlayerArea opponent gameProps={this.props} />
          <div
            className="background"
            style={{
              position: 'absolute',
              left: 0,
              top: 75,
              bottom: 75,
              right: 0,
              margin: '0 auto',
              zIndex: BOARD_Z_INDEX,
              width: boardSize
            }}
          >
            <Status status={(isMyTurn || isSandbox) ? status : {}} />
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
              onEndGame={onClickEndGame} />
          </div>
          <PlayerArea gameProps={this.props} />
          <EventAnimation eventQueue={eventQueue} currentTurn={currentTurn} />
          <VictoryScreen
            winnerColor={winner}
            winnerName={winner ? usernames[winner] : null}
            onClick={onClickEndGame} />
        </Paper>

        {this.renderSidebar()}
      </div>
    );
  }
}
