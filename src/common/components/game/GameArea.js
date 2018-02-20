import React, { Component } from 'react';
import { arrayOf, bool, func, number, object, string } from 'prop-types';
import Notification from 'react-web-notification';
import Paper from 'material-ui/Paper';
import screenfull from 'screenfull';

import Chat from '../multiplayer/Chat';
import { inBrowser } from '../../util/browser';

import Board from './Board';
import Timer from './Timer';
import EndTurnButton from './EndTurnButton';
import ForfeitButton from './ForfeitButton';
import SoundToggle from './SoundToggle';
import FullscreenToggle from './FullscreenToggle';
import PlayerArea from './PlayerArea';
import Status from './Status';
import Sfx from './Sfx';
import EventAnimation from './EventAnimation';
import VictoryScreen from './VictoryScreen';
import TutorialTooltip from './TutorialTooltip';

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
    boardSize: 1000
  };

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener('resize', () => { this.updateDimensions(); });
  }

  get isMyTurn() {
    return this.props.currentTurn === this.props.player;
  }

  handleToggleFullScreen = () => {
    screenfull.toggle(this.gameArea);
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

  renderNotification() {
    const options = {
      tag: 'wordbots',
      icon: '/static/icons/android-icon-144x144.png',
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
          onClick={window.focus} />
      );
    }
  }

  render() {
    if (this.props.message) {
      return (
        <div style={{
          position: 'absolute',
          left: 0,
          width: '100%',
          height: this.state.areaHeight,
          zIndex: 9999,
          background: `url(${this.loadBackground()})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Carter One',
          fontSize: 26,
          color: 'white'
        }}>
          {this.props.message}
        </div>
      );
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
          {this.renderNotification()}
          <Sfx queue={this.props.sfxQueue} />
        </div>

        <Paper
          className="background"
          style={{
            position: 'relative',
            marginRight: this.props.chatOpen ? 256 : 64,
            height: screenfull.isFullscreen ? this.state.areaHeight + 64 : this.state.areaHeight,
            background: `url(${this.loadBackground()})`
          }}
          onClick={this.props.onClickGameArea}
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
                player={this.props.player}
                currentTurn={this.props.currentTurn}
                gameOver={this.props.gameOver}
                isTutorial={this.props.isTutorial}
                isMyTurn={this.props.isMyTurn}
                isAttackHappening={this.props.isAttackHappening}
                onPassTurn={this.props.onPassTurn} />
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
                tutorialStep={this.props.tutorialStep}
                enabled={this.props.tutorialStep && this.props.tutorialStep.tooltip.location === 'endTurnButton'}
                top={0}
                place="left"
                onNextStep={this.props.onNextTutorialStep}
                onPrevStep={this.props.onPrevTutorialStep}
              >
                <EndTurnButton
                  player={this.props.player}
                  gameOver={this.props.gameOver}
                  isMyTurn={this.props.isMyTurn}
                  isAttackHappening={this.props.isAttackHappening}
                  onPassTurn={this.props.onPassTurn} />
              </TutorialTooltip>
              <ForfeitButton
                player={this.props.player}
                history={this.props.history}
                gameOver={this.props.gameOver}
                isSpectator={this.props.isSpectator}
                isTutorial={this.props.isTutorial}
                onForfeit={this.props.onForfeit} />
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
              width: this.state.boardSize
            }}
          >
            <Status status={this.isMyTurn ? this.props.status : {}} />
            <Board
              size={this.state.boardSize}
              player={this.props.player}
              currentTurn={this.props.currentTurn}
              selectedTile={this.props.selectedTile}
              target={this.props.target}
              bluePieces={this.props.bluePieces}
              orangePieces={this.props.orangePieces}
              playingCardType={this.props.playingCardType}
              tutorialStep={this.props.tutorialStep}
              attack={this.props.attack}
              isGameOver={!!this.props.winner}
              onSelectTile={this.props.onSelectTile}
              onActivateAbility={this.props.onActivateObject}
              onTutorialStep={this.props.onTutorialStep}
              onEndGame={this.props.onClickEndGame} />
          </div>
          <PlayerArea gameProps={this.props} />
          <EventAnimation eventQueue={this.props.eventQueue} currentTurn={this.props.currentTurn} />
          <VictoryScreen
            winnerColor={this.props.winner}
            winnerName={this.props.winner ? this.props.usernames[this.props.winner] : null}
            onClick={this.props.onClickEndGame} />
        </Paper>

        <Chat
          inGame
          fullscreen={screenfull.isFullscreen}
          open={this.props.chatOpen}
          toggleChat={this.toggleChat}
          roomName={this.props.socket.hosting ? null : this.props.socket.gameName}
          messages={this.props.socket.chatMessages.concat(this.props.actionLog)}
          onSendMessage={this.props.onSendChatMessage} />
      </div>
    );
  }
}
