import React, { Component } from 'react';
import { bool, func, object, string } from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Divider from 'material-ui/Divider';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';

import { DISABLE_TURN_TIMER } from '../constants';
import { isFlagSet, toggleFlag } from '../util/browser';
import { opponent, currentTutorialStep } from '../util/game';
import * as gameActions from '../actions/game';
import * as socketActions from '../actions/socket';
import TutorialTooltip from '../components/game/TutorialTooltip';
import Tooltip from '../components/Tooltip';

export function mapStateToProps(state) {
  return {
    player: state.game.player,
    currentTurn: state.game.currentTurn,
    gameOver: state.game.winner !== null,
    isTutorial: state.game.tutorial,
    isMyTurn: state.game.currentTurn === state.game.player,
    isSpectator: !['blue', 'orange'].includes(state.game.player),
    isAttackHappening: state.game.attack && state.game.attack.from && state.game.attack.to,
    tutorialStep: currentTutorialStep(state.game)
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    onActivate: (abilityIdx) => {
      dispatch(gameActions.activateObject(abilityIdx));
    },
    onForfeit: (winner) => {
      dispatch([
        socketActions.forfeit(winner),
        socketActions.leave()
      ]);
    },
    onPassTurn: (player) => {
      dispatch(gameActions.passTurn(player));
    },
    onTutorialStep: (back) => {
      dispatch(gameActions.tutorialStep(back));
    }
  };
}

export class GameMenu extends Component {
  static propTypes = {
    player: string,
    currentTurn: string,
    gameOver: bool,
    isTutorial: bool,
    isMyTurn: bool,
    isSpectator: bool,
    isAttackHappening: bool,
    tutorialStep: object,

    history: object,

    onActivate: func,
    onForfeit: func,
    onPassTurn: func,
    onTutorialStep: func
  };

  constructor(props) {
    super(props);

    this.state = {
      selectedAbility: 0,
      timer: '1:30',
      timerStyle: {
        color: 'white',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'normal',
        fontFamily: 'Carter One',
        cursor: 'default'
      }
    };
  }

  componentDidMount() {
    this.resetTimer();
    setInterval(() => {
      if (!this.props.gameOver && !this.props.isTutorial && !DISABLE_TURN_TIMER) {
        this.tickTimer();
      }
    }, 1000);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.currentTurn !== this.props.currentTurn) {
      this.resetTimer();
    }
  }

  get isExpanded() {
    return true; // !isFlagSet('sidebarCollapsed') || this.props.isTutorial;
  }

  resetTimer() {
    this.setTimer(1, 30, 'white');
  }

  padDigits(seconds) {
    return (seconds < 10 ? '0' : '') + seconds;
  }

  setTimer(minutes, seconds, color) {
    this.setState({
      selectedAbility: this.state.selectedAbility,
      timer: `${minutes}:${seconds}`,
      timerStyle: {
        color: color,
        textAlign: 'center',
        backgroundColor: {orange: '#ffb85d', blue: '#badbff'}[this.props.currentTurn],
        fontSize: this.isExpanded ? 24 : 18,
        fontWeight: color === 'red' ? 'bold' : 'normal',
        fontFamily: 'Carter One',
        cursor: 'default',
        padding: this.isExpanded ? '0 16px': 0
      }
    });
  }

  tickTimer() {
    const [, minutes, seconds] = this.state.timer.match(/(.):(..)/).map(num => parseInt(num));

    if (minutes === 1) {
      if (seconds === 0) {
        this.setTimer(0, 59, 'white');
      } else {
        this.setTimer(1, this.padDigits(seconds - 1), 'white');
      }
    } else if (seconds > 0 && seconds <= 6) {
      this.setTimer(0, this.padDigits(seconds - 1), 'red');
    } else if (seconds > 0) {
      this.setTimer(0, this.padDigits(seconds - 1), 'white');
    } else {
      this.timerEnd();
    }
  }

  timerEnd = () => {
    if (this.props.isMyTurn) {
      if (this.props.isAttackHappening) {
        setTimeout(this.timerEnd, 1000);
      } else {
        this.props.onPassTurn(this.props.player);
      }
    }
  }

  get styles() {
    return {
      icon: {
        left: this.isExpanded ? 4 : 8
      },
      tooltip: {
        zIndex: 99999
      }
    };
  }

  renderTimer() {
    return (
      <MenuItem
        disabled
        primaryText={this.props.isTutorial ? '' : this.state.timer}
        style={this.state.timerStyle} />
    );
  }

  renderButtons() {
    const buttonTextWithTooltip = (text, locationID) => (
      <TutorialTooltip
        tutorialStep={this.props.tutorialStep}
        enabled={this.props.tutorialStep && this.props.tutorialStep.tooltip.location === locationID}
        top={0}
        left={-80}
        place="left"
        onNextStep={() => { this.props.onTutorialStep(); }}
        onPrevStep={() => { this.props.onTutorialStep(true); }}
      >
        <span>{text}</span>
      </TutorialTooltip>
    );

    return (
      <div>
        <Tooltip disable={this.isExpanded} text="End Turn" place="right" style={this.styles.tooltip}>
          <MenuItem
            primaryText={this.isExpanded ? buttonTextWithTooltip('End Turn', 'endTurnButton') : ''}
            disabled={!this.props.isMyTurn || this.props.isAttackHappening || this.props.gameOver}
            leftIcon={<FontIcon className="material-icons" style={this.styles.icon}>timer</FontIcon>}
            onClick={() => { this.props.onPassTurn(this.props.player); }} />
        </Tooltip>
        <Tooltip disable={this.isExpanded} text="Forfeit" place="right" style={this.styles.tooltip}>
          <MenuItem
            primaryText={this.isExpanded ? buttonTextWithTooltip('Forfeit', 'forfeitButton') : ''}
            disabled={this.props.isSpectator || this.props.gameOver}
            leftIcon={<FontIcon className="material-icons" style={this.styles.icon}>flag</FontIcon>}
            onClick={() => {
              this.props.onForfeit(opponent(this.props.player));

              if (this.props.isTutorial) {
                this.props.history.push('/play');
              }
            }} />
        </Tooltip>
      </div>
    );
  }

  renderSoundWidget() {
    const soundText = `Sound: ${isFlagSet('sound') ? 'On' : 'Off'}`;

    return (
      <Tooltip disable={this.isExpanded} text={soundText} style={this.styles.tooltip}>
        <MenuItem
          primaryText={this.isExpanded ? soundText : ''}
          leftIcon={
            <FontIcon className="material-icons" style={this.styles.icon}>
              {isFlagSet('sound') ? 'volume_up' : 'volume_off'}
            </FontIcon>
          }
          onClick={() => {
            toggleFlag('sound');
            this.forceUpdate();
          }}/>
      </Tooltip>
    );
  }

  render() {
    return (
      <Drawer openSecondary docked containerStyle={{
        top: 64,
        width: this.isExpanded ? 256 : 64,
        transition: 'width 200ms ease-in-out',
        height: 194
      }}>
        {this.renderTimer()}
        <Divider />
        {this.renderButtons()}
        <Divider />
        {this.renderSoundWidget()}
      </Drawer>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameMenu));
