import React, { Component } from 'react';
import { array, object, oneOfType, string } from 'prop-types';
import Popover from 'react-popover';

export default class TutorialTooltip extends Component {
  static propTypes = {
    children: oneOfType([array, object]),
    text: string
  };

  get styles() {
    return {
      container: {
        zIndex: 99999,
        marginTop: 15
      },
      tooltip: {
        border: '1px solid black',
        padding: 5,
        background: '#CCC'
      }
    };
  }

  render() {
    return (
      <Popover
        isOpen
        style={this.styles.container}
        body={
          <div style={this.styles.tooltip}>
            {this.props.text}
          </div>
        }
      >
        {this.props.children}
      </Popover>
    );
  }
}
