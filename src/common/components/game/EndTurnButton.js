import * as React from 'react';
import { string, bool, func, object } from 'prop-types';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';

import { ORANGE_PLAYER_COLOR, BLUE_PLAYER_COLOR } from '../../constants.ts';

import TutorialTooltip from './TutorialTooltip';

export default class EndTurnButton extends React.Component {
  static propTypes = {
    player: string,
    gameOver: bool,
    isMyTurn: bool,
    isAttackHappening: bool,
    tutorialStep: object,

    onPassTurn: func,
    onNextTutorialStep: func,
    onPrevTutorialStep: func
  };

  get buttonEnabled() {
    const { isMyTurn, isAttackHappening, gameOver } = this.props;
    return isMyTurn && !isAttackHappening && !gameOver;
  }

  get tutorialTooltipEnabled() {
    const { tutorialStep } = this.props;
    return tutorialStep && tutorialStep.tooltip.location === 'endTurnButton';
  }

  handleClick = () => { this.props.onPassTurn(this.props.player); };

  render() {
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
          backgroundColor={{orange: ORANGE_PLAYER_COLOR, blue: BLUE_PLAYER_COLOR}[player]}
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
            }}>
              timer
            </FontIcon>
          }
          id="end-turn-button"
          disabled={!this.buttonEnabled} />
        </TutorialTooltip>
    );
  }
}
