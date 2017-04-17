import React, { Component } from 'react';
import { object, string } from 'prop-types';

export default class Status extends Component {
  static propTypes = {
    status: object,
    player: string
  };

  get color() {
    if (this.props.status.type === 'error') {
      return '#F44336';
    } else if (this.props.status.type === 'warning') {
      return '#FFEB3B';
    } else {
      return '#444444';
    }
  }

  render() {
    return (
      <div style={{
        display: 'inline-block',
        position: 'absolute',
        left: 10,
        margin: 'auto',
        height: 20,
        fontFamily: 'Carter One',
        fontSize: 20,
        bottom: 70,
        color: this.color
      }}>
        {this.props.status.message}
      </div>
    );
  }
}
