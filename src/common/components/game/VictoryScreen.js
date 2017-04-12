import React, { Component } from 'react';
import { func, string } from 'prop-types';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

export default class VictoryScreen extends Component {
  static propTypes = {
    winner: string,
    onClick: func
  };

  render() {
    const colors = {
      'orange': '#ffb85d',
      'blue': '#badbff'
    };

    return (
      <div
        onClick={this.props.onClick}
        style={{
          display: this.props.winner === null ? 'none' : 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          right: 0,
          fontFamily: 'Carter One',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          fontSize: 96,
          color: this.props.winner === null ? 'black' : colors[this.props.winner],
          borderRadius: 2
      }}>
        <CSSTransitionGroup
          transitionName="card-viewer-fade"
          transitionEnterTimeout={100}
          transitionLeaveTimeout={100}>
          <div>{this.props.winner === null ? '' : `${this.props.winner  } Wins!`}</div>
        </CSSTransitionGroup>
      </div>
    );
  }
}
