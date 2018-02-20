import React, { Component } from 'react';
import { arrayOf, bool, func, number, object, string } from 'prop-types';
import Paper from 'material-ui/Paper';
import screenfull from 'screenfull';

import Chat from '../multiplayer/Chat';
import { inBrowser } from '../../util/browser';

import Board from './Board';
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
import TutorialTooltip from './TutorialTooltip';
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

    chatOpen: bool,
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
    onSelectTile: func
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

  handleToggleFullScreen = () => {
    screenfull.toggle(this.gameArea);
  };

  handleToggleChat = () => {
    this.setState(state => ({ chatOpen: !state.chatOpen }));
  };

  loadBackground = () => inBrowser() ? require('../img/black_bg_lodyas.png') : '';

  updateDimensions = () => {
    const maxBoardHeight = window.innerHeight - 64 - 150;
    const maxBoardWidth = window.innerWidth - 256;

    this.setState({
      areaHeight: window.innerHeight - 64,
      boardSize: Math.min(maxBoardWidth, maxBoardHeight)
    });
  };

  render() {
    const {
      actionLog, attack, bluePieces, currentTurn, eventQueue, gameOver, isAttackHappening,
      isMyTurn, isSpectator, isTutorial, message, orangePieces, player, playingCardType,
      selectedTile, sfxQueue, socket, status, target, tutorialStep, usernames, winner,
      onActivateObject, onClickEndGame, onClickGameArea, onForfeit, onNextTutorialStep,
      onPassTurn, onPrevTutorialStep, onSelectTile, onSendChatMessage, onTutorialStep
    } = this.props;
    const { areaHeight, boardSize, chatOpen } = this.state;

    if (message) {
      return <FullscreenMessage message={message} height={areaHeight} background={this.loadBackground()} />;
    }

    return (
      <div
        id="gameArea"
        className="gameArea"
        ref={(gameArea) => { this.gameArea = gameArea; }}
        style={
          screenfull.isFullscreen ? {width: '100%', height: '100%'} : {}
        }
      >
        <div>
          <GameNotification text="It's your turn!" enabled={currentTurn === player} />
          <Sfx queue={sfxQueue} />
        </div>

        <Paper
          className="background"
          style={{
            position: 'relative',
            marginRight: chatOpen ? 256 : 64,
            height: screenfull.isFullscreen ? areaHeight + 64 : areaHeight,
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
                zIndex: 9999
              }}
            >
              <Timer
                player={player}
                currentTurn={currentTurn}
                gameOver={gameOver}
                isTutorial={isTutorial}
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
                zIndex: 9999
              }}
            >
              <TutorialTooltip
                tutorialStep={tutorialStep}
                enabled={tutorialStep && tutorialStep.tooltip.location === 'endTurnButton'}
                top={0}
                place="left"
                onNextStep={onNextTutorialStep}
                onPrevStep={onPrevTutorialStep}
              >
                <EndTurnButton
                  player={player}
                  gameOver={gameOver}
                  isMyTurn={isMyTurn}
                  isAttackHappening={isAttackHappening}
                  onPassTurn={onPassTurn} />
              </TutorialTooltip>
              <ForfeitButton
                player={player}
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
              zIndex: 999,
              width: boardSize
            }}
          >
            <Status status={isMyTurn ? status : {}} />
            <Board
              size={this.state.boardSize}
              player={player}
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

        <Chat
          inGame
          fullscreen={screenfull.isFullscreen}
          open={chatOpen}
          toggleChat={this.handleToggleChat}
          roomName={socket.hosting ? null : socket.gameName}
          messages={socket.chatMessages.concat(actionLog)}
          onSendMessage={onSendChatMessage} />
      </div>
    );
  }
}
