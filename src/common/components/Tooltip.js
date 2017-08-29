import React, {Component} from 'react';
import {array, bool, object, oneOfType, string} from 'prop-types';
import ReactTooltip from 'react-tooltip';

import {id} from '../util/common';

export default class Tooltip extends Component {
  static propTypes = {
    inline: bool,
    style: object,
    text: string.isRequired,
    children: oneOfType([ array, object ]),
    disable: bool,
    place: string
  };

  static defaultProps = {
    inline: false,
    style: {},
    disable: false,
    place: 'top'
  };

  tooltipId = id();

  render() {
    const SpanOrDiv = this.props.inline ? 'span' : 'div';

    return (
      <SpanOrDiv>
        <SpanOrDiv data-tip={this.props.text} data-for={this.tooltipId}>
          {this.props.children}
        </SpanOrDiv>
        <SpanOrDiv style={this.props.style}>
          <ReactTooltip id={this.tooltipId} disable={this.props.disable} place={this.props.place} />
        </SpanOrDiv>
      </SpanOrDiv>
    );
  }
}
