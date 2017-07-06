import React, { Component } from 'react';
import { array, bool, object, oneOfType, string } from 'prop-types';
import ReactTooltip from 'react-tooltip';

import { id } from '../util/common';

export default class CardTooltip extends Component {
  static propTypes = {
    inline: bool,
    style: object,
    body: object,
    offset: object,
    class: string, 
    children: oneOfType([array, object]),
    place: string
  };

  static defaultProps = {
    inline: false,
    style: {},
    place: 'top'
  }

  tooltipId = id()

  render() {
    const SpanOrDiv = this.props.inline ? 'span' : 'div';

    return (
      <SpanOrDiv>
        <SpanOrDiv data-tip="" data-for={this.tooltipId}>
          {this.props.children}
        </SpanOrDiv>
        <SpanOrDiv style={this.props.style}>
          <ReactTooltip
            className="hovered-card"
            id={this.tooltipId}
            offset={this.props.offset}
            place={this.props.place}>
            {this.props.body}
          </ReactTooltip>
        </SpanOrDiv>
      </SpanOrDiv>
    );
  }
}
