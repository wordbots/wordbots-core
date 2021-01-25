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
  isAttackHappening?: boolean
  tutorialStep?: w.TutorialStep

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
    const { player, compact, tutorialStep, onNextTutorialStep, onPrevTutorialStep } = this.props;
    const height = compact ? '40px' : '64px';

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
          className="end-turn-button"
          variant="contained"
          style={{
            backgroundColor: player ? {orange: ORANGE_PLAYER_COLOR, blue: BLUE_PLAYER_COLOR}[player] : undefined,
            border: '2px solid #eee',
            borderRadius: 5,
            color: '#FFF',
            fontFamily: 'Carter One',
            fontSize: compact ? 22 : 32,
            height,
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
          End Turn
        </Button>
      </TutorialTooltip>
    );
  }

  private handleClick = () => {
    const { player, onPassTurn } = this.props;
    if (player) {
      onPassTurn(player);
    }
  }
}
