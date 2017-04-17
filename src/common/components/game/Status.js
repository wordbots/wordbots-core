import React, { Component } from 'react';
import { object, string } from 'prop-types';

export default class Status extends Component {
  static propTypes = {
    status: object,
    player: string
  };

  getStatusColor(type) {
    if (type === 'error') {
      return '#F44336';
    } else if (type === 'warning') {
      return '#FFEB3B';
    } else {
      return '#444444';
    }
  }

  render() {
    const statusStyle = this.getStatusColor(this.props.status.type);

    return (
      <div style={Object.assign({
        display: 'inline-block',
        position: 'absolute',
        left: 10,
        margin: 'auto',
        height: 20,
        fontFamily: 'Carter One',
        fontSize: 20,
        bottom: 70
      }, statusStyle)}>{this.props.status.message}</div>
    );
  }
}
