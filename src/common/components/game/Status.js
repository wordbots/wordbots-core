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
      return '#CCCCCC';
    }
  }

  render() {
    return (
      <div style={{
        display: 'inline-block',
        position: 'absolute',
        top: 50,
        margin: 'auto',
        width: '100%',
        height: 20,
        textAlign: 'center',
        fontFamily: 'Carter One',
        fontSize: 20,
        color: this.color
      }}>
        {this.props.status.message}
      </div>
    );
  }
}
