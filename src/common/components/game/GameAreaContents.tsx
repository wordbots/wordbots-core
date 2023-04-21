import { History } from 'history';
import * as React from 'react';

import * as w from '../../types';
import { BACKGROUND_Z_INDEX, BOARD_Z_INDEX, SIDEBAR_COLLAPSED_WIDTH } from '../../constants';
import { doesBrowserSupportContentAnimation } from '../../util/browser';

import Board from './Board';
import DraftArea from './DraftArea';
import EndTurnButton from './EndTurnButton';
import EventAnimation from './EventAnimation';
import ForfeitButton from './ForfeitButton';
import { GameAreaHandlerProps, GameProps } from './GameArea';
import LeftControls from './LeftControls';
import PlayerArea from './PlayerArea';
import TutorialIntroScreen from './TutorialIntroScreen';
import VictoryScreen from './VictoryScreen';
import ParsingIndicator from './ParsingIndicator';

type GameAreaContentsProps = GameProps & GameAreaHandlerProps & {
  actualPlayer: w.PlayerColor | null
  boardSize: number
  boardMargin: { left: number, top: number }
  compactControls: boolean
  chatOpen: boolean
  startAnimationComplete: boolean
  onToggleFullscreen: () => void
  history: History
}

/** Renders the interior contents of the GameArea (board, player areas, controls)
 *  - or the draft area if in draft mode. */
export default class GameAreaContents extends React.PureComponent<GameAreaContentsProps> {
  public render = (): JSX.Element => {
    const {
      attack, bluePieces, currentTurn, disconnectedPlayers, draft, eventQueue, format, gameOptions, gameOver, isAttackHappening,
      isMyTurn, isMyTurnAndNoActionsLeft, isPaused, isPractice, isSandbox, isSpectator, isTutorial, isWaitingForParse, joinedInProgressGame,
      orangePieces, player, playingCardType, selectedTile, target, tutorialStep, usernames, winner, volume,
      onActivateObject, onClickEndGame, onForfeit, onNextTutorialStep,
      onPassTurn, onPrevTutorialStep, onSelectTile, onTutorialStep, onDraftCards, onSetVolume,
      actualPlayer, boardSize, boardMargin, compactControls, startAnimationComplete, onToggleFullscreen, history
    } = this.props;

    const shouldShowCountdownAnimation = !isTutorial && !isSandbox && !joinedInProgressGame && doesBrowserSupportContentAnimation();

    if (draft) {
      return (
        <React.Fragment>
          <DraftArea
            player={player}
            usernames={usernames}
            disconnectedPlayers={disconnectedPlayers}
            draft={draft}
            format={format}
            isGameOver={gameOver}
            volume={volume}
            onDraftCards={onDraftCards}
            onForfeit={onForfeit}
            onSetVolume={onSetVolume}
            onToggleFullscreen={onToggleFullscreen}
          />
          <VictoryScreen
            winner={winner}
            winnerName={(winner && winner !== 'draw' && winner !== 'aborted') ? usernames[winner] : null}
            onClick={onClickEndGame}
          />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <div
            className="background"
            style={{
              display: 'flex',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: isSandbox ? SIDEBAR_COLLAPSED_WIDTH : 0
            }}
          >
            <LeftControls
              player={player}
              currentTurn={currentTurn}
              draft={draft}
              isTimerEnabled={!gameOver && !isTutorial && !isPractice && !isSandbox && !gameOptions.disableTurnTimer && startAnimationComplete}
              isMyTurn={isMyTurn}
              isPaused={isPaused || isWaitingForParse}
              isAttackHappening={isAttackHappening}
              volume={volume}
              onPassTurn={onPassTurn}
              onSetVolume={onSetVolume}
              onToggleFullscreen={onToggleFullscreen}
            />

            <div
              className="background"
              style={{
                marginRight: 20,
                maxWidth: 220,
                textAlign: 'right',
                zIndex: BACKGROUND_Z_INDEX
              }}
            >
              <EndTurnButton
                player={actualPlayer}
                compact={compactControls}
                gameOver={gameOver}
                isMyTurn={(isMyTurn && !isPaused) || isSandbox}
                isMyTurnAndNoActionsLeft={isMyTurnAndNoActionsLeft}
                isAttackHappening={isAttackHappening}
                isWaitingForParse={isWaitingForParse}
                tutorialStep={tutorialStep}
                onPassTurn={onPassTurn}
                onNextTutorialStep={onNextTutorialStep}
                onPrevTutorialStep={onPrevTutorialStep}
              />
              <ForfeitButton
                text={isSandbox ? "Exit Sandbox" : (isSpectator ? "Stop Spectating" : "Forfeit")}
                player={actualPlayer}
                compact={compactControls}
                history={history}
                gameOver={gameOver}
                isSpectator={isSpectator}
                isTutorial={isTutorial}
                isSandbox={isSandbox}
                onForfeit={isSandbox ? onClickEndGame : onForfeit}
              />
            </div>
          </div>
          <PlayerArea opponent gameProps={this.props} />
          <div
            className="background"
            style={{
              position: 'absolute',
              left: boardMargin.left,
              top: boardMargin.top,
              margin: 0,
              zIndex: BOARD_Z_INDEX,
              width: boardSize,
              height: boardSize,
              // border: '5px solid white'  /* (useful for debugging layout) */
            }}
          >
            <div className={`boardAnimationContainer ${shouldShowCountdownAnimation ? 'enableCountdown' : 'disableCountdown'}`}>
              <div className="boardAnimation">
                <div className="bubble" />
                <Board
                  size={boardSize}
                  player={actualPlayer}
                  currentTurn={currentTurn}
                  selectedTile={selectedTile}
                  target={target}
                  bluePieces={bluePieces}
                  orangePieces={orangePieces}
                  playingCardType={playingCardType}
                  tutorialStep={tutorialStep}
                  attack={attack}
                  isGameOver={!!winner}
                  isPaused={isPaused || isWaitingForParse}
                  onSelectTile={onSelectTile}
                  onActivateAbility={onActivateObject}
                  onTutorialStep={onTutorialStep}
                  onEndGame={onClickEndGame}
                />
              </div>
            </div>
          </div>
          <PlayerArea gameProps={this.props} />
          <EventAnimation eventQueue={eventQueue} currentTurn={currentTurn} />
          <VictoryScreen
            winner={winner}
            winnerName={(winner && winner !== 'draw' && winner !== 'aborted') ? usernames[winner] : null}
            onClick={onClickEndGame}
          />
          <ParsingIndicator isWaitingForParse={isWaitingForParse && !winner} />
          {isTutorial && tutorialStep?.idx === 0 ? <TutorialIntroScreen onClickEndGame={onClickEndGame} /> : null}
        </React.Fragment>
      );
    }
  }
}
