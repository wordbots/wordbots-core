import * as React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { EVENT_ANIMATION_TIME_MS, EVENT_ANIMATION_Z_INDEX } from '../../constants';
import * as w from '../../types';
import { Card } from '../card/Card';

interface EventAnimationProps {
  currentTurn: w.PlayerColor
  eventQueue: w.CardInGame[]
}

interface EventAnimationState {
  idx: number
  timeout?: NodeJS.Timeout
}

export default class EventAnimation extends React.Component<EventAnimationProps, EventAnimationState> {
  public state: EventAnimationState = {
    idx: 0
  };

  get currentEvent(): w.CardInGame | undefined {
    return this.props.eventQueue[this.state.idx];
  }

  public componentDidUpdate(nextProps: EventAnimationProps): void {
    if (nextProps.eventQueue.length !== this.props.eventQueue.length) {
      this.resetTimeout();
    }
  }

  public render(): JSX.Element | null {
    if (this.currentEvent) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            zIndex: EVENT_ANIMATION_Z_INDEX
          }}
        >
          <TransitionGroup>
            <CSSTransition
              appear
              classNames={`event-animation-${this.props.currentTurn}`}
              timeout={500}
            >
              {this.renderEvent()}
            </CSSTransition>
          </TransitionGroup>
        </div>
      );
    } else {
      return null;
    }
  }

  private resetTimeout = () => {
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
    }

    this.setState({timeout: setTimeout(this.proceedToNextEvent, EVENT_ANIMATION_TIME_MS) });
  }

  private proceedToNextEvent = () => {
    this.setState((state) => ({idx: state.idx + 1}));
    if (this.currentEvent) {
      this.resetTimeout();
    }
  }

  private renderEvent(): JSX.Element | undefined {
    return this.currentEvent && Card.fromObj(this.currentEvent, { scale: 1.3 });
  }
}
