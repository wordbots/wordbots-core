import React, { Component } from 'react';
import { array, bool, object, oneOfType, string } from 'prop-types';
import ReactTooltip from 'react-tooltip';

import { id } from '../util/common';

export default class Tooltip extends Component {
  static propTypes = {
    inline: bool,
    style: object,
    text: string.isRequired,
    children: oneOfType([array, object])
  };

  static defaultProps = {
    inline: false,
    style: {}
  }

  render() {
    const tooltipId = id();

    if (this.props.inline) {
      return (
        <span>
          <span data-tip={this.props.text} data-for={tooltipId}>
            {this.props.children}
          </span>
          <span style={this.props.style}>
            <ReactTooltip id={tooltipId} />
          </span>
        </span>
      );
    } else {
      return (
        <div>
          <div data-tip={this.props.text} data-for={tooltipId}>
            {this.props.children}
          </div>
          <div style={this.props.style}>
            <ReactTooltip id={tooltipId} />
          </div>
        </div>
      );
    }
  }
}
