import React, { Component } from 'react';
import { array } from 'prop-types';
import { CSSTransitionGroup } from 'react-transition-group';

import Card from '../card/Card';

export default class EventAnimation extends Component {
  static propTypes = {
    eventQueue: array
  };

  constructor(props) {
    super(props);

    this.state = {
      idx: 0
    };
  }

  get currentEvent() {
    if (this.props.eventQueue) {
      return this.props.eventQueue[this.state.idx];
    } else {
      return null;
    }
  }

  proceedToNextEvent = () => {
    this.setState({idx: this.state.idx + 1});
  }

  renderEvent() {
    setTimeout(() => this.proceedToNextEvent(), 1000);
    return Card.fromObj(this.currentEvent);
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
          <CSSTransitionGroup
            transitionName="event-animation"
            transitionAppear
            transitionAppearTimeout={500}
            transitionEnterTimeout={500}
            transitionLeaveTimeout={500}>
            {this.renderEvent()}
          </CSSTransitionGroup>
        </div>
      );
    } else {
      return null;
    }
  }
}
