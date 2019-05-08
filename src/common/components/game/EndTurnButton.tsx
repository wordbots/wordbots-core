import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import * as React from 'react';

import { BLUE_PLAYER_COLOR, ORANGE_PLAYER_COLOR } from '../../constants';
import * as w from '../../types';

import TutorialTooltip from './TutorialTooltip';

interface EndTurnButtonProps {
  player: w.PlayerColor | null
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
    return !!tutorialStep && tutorialStep.tooltip.location === 'endTurnButton';
  }

  public render(): JSX.Element {
    const { player, tutorialStep, onNextTutorialStep, onPrevTutorialStep } = this.props;
    return (
      <TutorialTooltip
        tutorialStep={tutorialStep}
        enabled={this.tutorialTooltipEnabled}
        top={0}
        place="left"
        onNextStep={onNextTutorialStep}
        onPrevStep={onPrevTutorialStep}
      >
        <RaisedButton
          className="end-turn-button"
          backgroundColor={player ? {orange: ORANGE_PLAYER_COLOR, blue: BLUE_PLAYER_COLOR}[player] : undefined}
          buttonStyle={{
            height: '64px',
            lineHeight: '64px'
          }}
          style={{
            borderRadius: 5,
            border: '2px solid #AAA'
          }}
          label="End Turn"
          labelStyle={{
            color: '#FFF',
            fontSize: 32,
            fontFamily: 'Carter One'
          }}
          overlayStyle={{
            height: '64px'
          }}
          onClick={this.handleClick}
          icon={
            <FontIcon
              className="material-icons"
              style={{
                lineHeight: '64px',
                verticalAlign: 'none'
              }}
            >
              timer
            </FontIcon>
          }
          disabled={!this.buttonEnabled}
        />
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
