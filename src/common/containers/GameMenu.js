import React, { Component } from 'react';
import { bool, func, object, string } from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Divider from 'material-ui/Divider';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';

import { DISABLE_TURN_TIMER } from '../constants';
import { soundEnabled, toggleSound } from '../util/common';
import { allObjectsOnBoard, opponent, ownerOf, currentTutorialStep } from '../util/game';
import * as gameActions from '../actions/game';
import * as socketActions from '../actions/socket';
import TutorialTooltip from '../components/game/TutorialTooltip';
import Tooltip from '../components/Tooltip';

export function mapStateToProps(state) {
  const activePlayer = state.game.players[state.game.player];
  const selectedPiece = allObjectsOnBoard(state.game)[activePlayer.selectedTile];

  return {
    player: state.game.player,
    currentTurn: state.game.currentTurn,
    gameOver: state.game.winner !== null,
    isTutorial: state.game.tutorial,
    isMyTurn: state.game.currentTurn === state.game.player,
    isMyPiece: selectedPiece && ownerOf(state.game, selectedPiece).name === state.game.player,
    isSpectator: !['blue', 'orange'].includes(state.game.player),
    selectedPiece: selectedPiece,
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
    open: bool,

    player: string,
    currentTurn: string,
    gameOver: bool,
    isTutorial: bool,
    isMyTurn: bool,
    isMyPiece: bool,
    isSpectator: bool,
    selectedPiece: object,
    tutorialStep: object,

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
        fontSize: '24',
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
        fontSize: this.props.open ? 24 : 18,
        fontWeight: color === 'red' ? 'bold' : 'normal',
        fontFamily: 'Carter One',
        cursor: 'default',
        padding: this.props.open ? '0 16px': 0
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
      if (this.props.isMyTurn) {
        this.props.onPassTurn(this.props.player);
      }
    }
  }

  renderTimer() {
    if (!this.props.isTutorial) {
      return (
        <MenuItem
          disabled
          primaryText={this.state.timer}
          style={this.state.timerStyle} />
      );
    }
  }

  get styles() {
    return {
      icon: {
        left: this.props.open ? 4 : 8
      },
      tooltip: {
        zIndex: 99999
      }
    };
  }

  renderButtons() {
    const buttonTextWithTooltip = (text, locationID) => (
      <TutorialTooltip
        tutorialStep={this.props.tutorialStep}
        enabled={this.props.tutorialStep && this.props.tutorialStep.tooltip.location === locationID}
        top={0}
        left={40}
        onNextStep={() => { this.props.onTutorialStep(); }}
        onPrevStep={() => { this.props.onTutorialStep(true); }}
      >
        <span>{text}</span>
      </TutorialTooltip>
    );

    return (
      <div>
      <Tooltip disable={this.props.open} text="End Turn" place="right" style={this.styles.tooltip}>
        <MenuItem
          primaryText={this.props.open ? buttonTextWithTooltip('End Turn', 'endTurnButton') : ''}
          disabled={!this.props.isMyTurn || this.props.gameOver}
          leftIcon={<FontIcon className="material-icons" style={this.styles.icon}>timer</FontIcon>}
          onClick={() => { this.props.onPassTurn(this.props.player); }} />
        </Tooltip>
        <Tooltip disable={this.props.open} text="Forfeit" place="right" style={this.styles.tooltip}>
          <MenuItem
            primaryText={this.props.open ? buttonTextWithTooltip('Forfeit', 'forfeitButton') : ''}
            disabled={this.props.isSpectator || this.props.gameOver}
            leftIcon={<FontIcon className="material-icons" style={this.styles.icon}>flag</FontIcon>}
            onClick={() => { this.props.onForfeit(opponent(this.props.player)); }} />
        </Tooltip>
      </div>
    );
  }

  renderActivatedAbilities() {
    const abilities = (this.props.selectedPiece && this.props.selectedPiece.activatedAbilities) || [];

    if (abilities.length > 0) {
      const canActivateAbility = this.props.isMyTurn && this.props.isMyPiece && !this.props.selectedPiece.cantActivate;

      return (
        <div>
          <MenuItem
            disabled
            primaryText="Activated Abilities"
            style={{
              textAlign: 'center',
              cursor: 'auto',
              color: '#333',
              fontWeight: 'bold'
            }} />
          {abilities.map((ability, idx) =>
            <MenuItem
              key={idx}
              disabled={!canActivateAbility}
              primaryText={`${ability.text}.`}
              onClick={() => { this.props.onActivate(idx); }} />
          )}
        </div>
      );
    } else {
      return null;
    }
  }

  renderSoundWidget() {
    const soundText = `Sound: ${soundEnabled() ? 'On' : 'Off'}`;

    return (
      <Tooltip disable={this.props.open} text={soundText} style={this.styles.tooltip}>
        <MenuItem
          primaryText={this.props.open ? soundText : ''}
          leftIcon={
            <FontIcon className="material-icons" style={this.styles.icon}>
              {soundEnabled() ? 'volume_up' : 'volume_off'}
            </FontIcon>
          }
          onClick={() => {
            toggleSound();
            this.forceUpdate();
          }}/>
      </Tooltip>
    );
  }

  render() {
    return (
      <Drawer open containerStyle={{
        top: 64,
        width: this.props.open ? 256 : 64,
        transition: 'width 200ms ease-in-out',
        height: 'calc(100% - 64px)',
        overflow: 'visible'
      }}>
        {this.renderTimer()}
        <Divider />

        {this.renderButtons()}
        <Divider />

        {this.renderActivatedAbilities()}
        <Divider />

        <div style={{
          position: 'absolute',
          bottom: 0,
          width: '100%'
        }}>
          <Divider />
          {this.renderSoundWidget()}
        </div>
      </Drawer>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameMenu));
