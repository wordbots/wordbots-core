import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import * as React from 'react';

import { BLUE_PLAYER_COLOR, ORANGE_PLAYER_COLOR } from '../../constants';
import * as w from '../../types';

import TutorialTooltip from './TutorialTooltip';

interface EndTurnButtonProps {
  player: w.PlayerColor | null
  compact?: boolean
  gameOver?: boolean
  isMyTurn?: boolean
  isMyTurnAndNoActionsLeft?: boolean
  isAttackHappening?: boolean
  tutorialStep?: w.TutorialStep
  isWaitingForParse: boolean

  onPassTurn: (color: w.PlayerColor) => void
  onNextTutorialStep: () => void
  onPrevTutorialStep: () => void
}

export default class EndTurnButton extends React.Component<EndTurnButtonProps> {
  get buttonEnabled(): boolean {
    const { isMyTurn, isAttackHappening, gameOver } = this.props;
    return !!isMyTurn && !isAttackHappening && !gameOver;
  }

  get tutorialTooltipEnabled(): boolean {
    const { tutorialStep } = this.props;
    return tutorialStep?.tooltip?.location === 'endTurnButton';
  }

  public render(): JSX.Element {
    const { player, isMyTurn, isMyTurnAndNoActionsLeft, compact, tutorialStep, onNextTutorialStep, onPrevTutorialStep } = this.props;

    return (
      <TutorialTooltip
        tutorialStep={tutorialStep}
        enabled={this.tutorialTooltipEnabled}
        top={0}
        place="left"
        onNextStep={onNextTutorialStep}
        onPrevStep={onPrevTutorialStep}
      >
        <Button
          className={`end-turn-button ${player} ${!isMyTurn && 'waiting'} ${isMyTurnAndNoActionsLeft && 'blink'}`}
          variant="contained"
          style={{
            backgroundColor: player ? { orange: ORANGE_PLAYER_COLOR, blue: BLUE_PLAYER_COLOR }[player] : undefined,
            border: '2px solid #eee',
            borderRadius: 5,
            color: '#FFF',
            fontFamily: '"Carter One", "Carter One-fallback"',
            fontSize: compact ? 22 : 32,
            width: compact ? 150 : 220,
            height: compact ? 40 : 64,
            padding: compact ? '0 5px' : '0 15px'
          }}
          onClick={this.handleClick}
          disabled={!this.buttonEnabled}
        >
          <Icon
            className="material-icons"
            style={{ paddingRight: 4 }}
          >
            timer
          </Icon>
          {isMyTurn ? 'End Turn' : 'Waiting'}
        </Button>
      </TutorialTooltip>
    );
  }

  private handleClick = () => {
    const { player, onPassTurn, isWaitingForParse } = this.props;
    if (player && !isWaitingForParse) {
      onPassTurn(player);
    }
  }
}
