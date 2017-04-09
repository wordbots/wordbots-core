import React, { Component } from 'react';
import { object, string } from 'prop-types';

export default class Status extends Component {
  static propTypes = {
    status: object,
    player: string
  };

  render() {
    const statusStyle = {
      color: '#444444',
      top: 0,
      bottom: 0
    };

    if (this.props.status.type === 'error') {
      statusStyle.color = '#F44336';
    } else if (this.props.status.type === 'warning') {
      statusStyle.color = '#FFEB3B';
    }

    if (this.props.player === 'orange') {
      statusStyle.top = 6;
      statusStyle.bottom = null;
    } else {
      statusStyle.bottom = 16;
      statusStyle.top = null;
    }

    return (
      <div style={Object.assign({
        display: 'inline-block',
        position: 'absolute',
        left: 0,
        margin: 'auto',
        height: 20,
        fontFamily: 'Carter One',
        fontSize: 20
      }, statusStyle)}>{this.props.status.message}</div>
    );
  }
}
