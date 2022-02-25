import * as React from 'react';

import { BLUE_PLAYER_COLOR, DISABLE_TURN_TIMER, ORANGE_PLAYER_COLOR } from '../../constants';
import * as w from '../../types';

interface TimerProps {
  minutes: number
  seconds: number
  player: w.PlayerColor | 'neither'
  currentTurn: w.PlayerColor | 'draft'
  enabled?: boolean
  isMyTurn?: boolean
  isAttackHappening?: boolean
  isWaitingForParse?: boolean
  onPassTurn: (player: w.PlayerColor) => void
}

interface TimerState {
  interval?: NodeJS.Timeout
  timer: string
  timerStyle: React.CSSProperties
}

function padDigits(seconds: number): string {
  return (seconds < 10 ? '0' : '') + seconds;
}

export default class Timer extends React.Component<TimerProps, TimerState> {
  public state: TimerState = {
    timer: `${this.props.minutes}:${this.props.seconds}`,
    timerStyle: {}
  };

  public componentDidMount(): void {
    (this as any).isPaused = false;

    const interval = setInterval(() => {
      if (this.props.enabled && !DISABLE_TURN_TIMER) {
        this.tickTimer();
      }
    }, 1000);

    this.resetTimer();
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ interval });
  }

  public componentDidUpdate(prevProps: TimerProps): void {
    (this as any).isPaused = this.props.isWaitingForParse;

    if (prevProps.currentTurn !== this.props.currentTurn) {
      this.resetTimer();
    }
  }

  public componentWillUnmount(): void {
    const { interval } = this.state;
    if (interval) {
      clearInterval(interval);
    }
  }

  get styles(): Record<string, React.CSSProperties> {
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

  public render(): JSX.Element | null {
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

  private resetTimer(): void {
    this.setTimer(this.props.minutes, this.props.seconds, 'white');
  }

  private setTimer(minutes: number, seconds: number, color: 'red' | 'white'): void {
    const { player, currentTurn } = this.props;
    this.setState({
      timer: `${minutes}:${padDigits(seconds)}`,
      timerStyle: {
        color: {
          orange: ORANGE_PLAYER_COLOR,
          blue: BLUE_PLAYER_COLOR,
          draft: ({ orange: ORANGE_PLAYER_COLOR, blue: BLUE_PLAYER_COLOR, neither: 'white' })[player]
        }[currentTurn],
        fontWeight: color === 'red' ? 'bold' : 'normal'
      }
    });
  }

  private tickTimer(): void {
    const [, minutes, seconds] = this.state.timer.match(/(.):(..)/)!.map((num) => parseInt(num, 10));

    // tickTimer() runs inside a setInterval closure, so it can't access updated props.
    // We use a "ref" (instance variable) to let tickTimer() know when it should be paused.
    if ((this as any).isPaused) {
      return;
    }

    if (minutes >= 1) {
      if (seconds === 0) {
        this.setTimer(minutes - 1, 59, 'white');
      } else {
        this.setTimer(minutes, seconds - 1, 'white');
      }
    } else if (seconds > 0 && seconds <= 6) {
      this.setTimer(0, seconds - 1, 'red');
    } else if (seconds > 0) {
      this.setTimer(0, seconds - 1, 'white');
    } else {
      this.timerEnd();
    }
  }

  private timerEnd = () => {
    const { player, isMyTurn, isAttackHappening, onPassTurn } = this.props;
    if (isMyTurn) {
      if (isAttackHappening) {
        setTimeout(this.timerEnd, 1000);
      } else {
        onPassTurn(player as w.PlayerColor);
      }
    }
  }
}
