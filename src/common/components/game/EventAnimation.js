import React, { Component } from 'react';
import { arrayOf, object, string } from 'prop-types';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { EVENT_ANIMATION_TIME_MS } from '../../constants';
import Card from '../card/Card';

export default class EventAnimation extends Component {
  static propTypes = {
    currentTurn: string.isRequired,
    eventQueue: arrayOf(object)
  };

  static defaultProps = {
    eventQueue: []
  };

  state = {
    idx: 0
  };

  componentDidUpdate(nextProps) {
    if (nextProps.eventQueue.length !== this.props.eventQueue.length) {
      this.resetTimeout();
    }
  }

  get currentEvent() {
    return this.props.eventQueue[this.state.idx];
  }

  resetTimeout = () => {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.proceedToNextEvent, EVENT_ANIMATION_TIME_MS);
  }

  proceedToNextEvent = () => {
    this.setState((state) => ({idx: state.idx + 1}));
    if (this.currentEvent) {
      this.resetTimeout();
    }
  }

  renderEvent() {
    return Card.fromObj(this.currentEvent, {scale: 1.3});
  }

  render() {
    if (this.currentEvent) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          right: 0,
          zIndex: 99999
        }}>
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
}
