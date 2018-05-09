import React, { Component } from 'react';
import { string } from 'prop-types';
import Snackbar from 'material-ui/Snackbar';

export default class Status extends Component {
  static propTypes = {
    type: string,
    message: string
  };

  get color() {
    return {
      error: '#F44336',
      warning: '#FFEB3B'
    }[this.props.type] || '#CCC';
  }

  render() {
    // TODO When we switch over to material-ui@next, there will be actual support
    // for top-center placement of snackbars.
    // For now we do this ugly hack: https://github.com/mui-org/material-ui/issues/4641
    return (
      <Snackbar
        open
        message={this.props.message}
        style={{
          top: 0,
          bottom: 'auto',
          left: (window.innerWidth - 350) / 2,
          transform: this.props.message ? 'translate3d(0, 0, 0)' : 'translate3d(0, -50px, 0)'
        }}
        bodyStyle={{
          minWidth: 320
        }}
        contentStyle={{
          color: this.color,
          textAlign: 'center',
          transition: 'none'
        }}
      />
    );
  }
}
