import * as React from 'react';
import { string, bool, func } from 'prop-types';

import { DISABLE_TURN_TIMER } from '../../constants.ts';

function padDigits(seconds) {
  return (seconds < 10 ? '0' : '') + seconds;
}

export default class Timer extends React.Component {
  static propTypes = {
    player: string,
    currentTurn: string,
    enabled: bool,
    isMyTurn: bool,
    isAttackHappening: bool,

    onPassTurn: func
  };

  state = {
    timer: '1:30'
  };

  componentDidMount() {
    this.resetTimer();
    this.interval = setInterval(() => {
      if (this.props.enabled && !DISABLE_TURN_TIMER) {
        this.tickTimer();
      }
    }, 1000);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.currentTurn !== this.props.currentTurn) {
      this.resetTimer();
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
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

  get isExpanded() {
    return true; // !isFlagSet('sidebarCollapsed') || this.props.isTutorial;
  }

  resetTimer() {
    this.setTimer(1, 30, 'white');
  }

  setTimer(minutes, seconds, color) {
    this.setState({
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
        this.setTimer(1, padDigits(seconds - 1), 'white');
      }
    } else if (seconds > 0 && seconds <= 6) {
      this.setTimer(0, padDigits(seconds - 1), 'red');
    } else if (seconds > 0) {
      this.setTimer(0, padDigits(seconds - 1), 'white');
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
    if (!this.props.enabled) {
      return null;
    } else {
      return (
        <div style={this.styles.timer}>
          <span style={this.state.timerStyle}>
            {this.state.timer}
          </span>
        </div>
      );
    }
  }
}
