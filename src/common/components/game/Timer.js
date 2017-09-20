import React, { Component } from 'react';
import { string, bool, func } from 'prop-types';

import { DISABLE_TURN_TIMER } from '../../constants';

export default class Timer extends Component {
  static propTypes = {
    player: string,
    currentTurn: string,
    gameOver: bool,
    isTutorial: bool,
    isMyTurn: bool,
    isAttackHappening: bool,

    onPassTurn: func
  };

  constructor(props) {
    super(props);

    this.state = {
      timer: '1:30'
    };
  }

  get styles() {
    return {
      timer: {
        width: 134,
        textAlign: 'center',
        backgroundColor: '#111',
        border: '2px solid #AAA',
        padding: 10,
        borderRadius: 5,
        boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
        fontFamily: 'VT323',
        fontSize: 72
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

  get isExpanded() {
    return true; // !isFlagSet('sidebarCollapsed') || this.props.isTutorial;
  }

  setTimer(minutes, seconds, color) {
    this.setState({
      selectedAbility: this.state.selectedAbility,
      timer: `${minutes}:${seconds}`,
      timerStyle: {
        color: {orange: '#ffb85d', blue: '#badbff'}[this.props.currentTurn],
        fontWeight: color === 'red' ? 'bold' : 'normal'
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

  render() {
    return (
      <div style={this.styles.timer}>
        <span style={this.state.timerStyle}>
          {this.props.isTutorial ? '' : this.state.timer}
        </span>
      </div>
    );
  }
}
