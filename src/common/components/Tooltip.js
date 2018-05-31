import React, { Component } from 'react';
import { arrayOf, bool, element, object, oneOfType, string } from 'prop-types';
import ReactTooltip from 'react-tooltip';

import { id } from '../util/common';

export default class Tooltip extends Component {
  static propTypes = {
    inline: bool,
    style: object,
    text: string.isRequired,
    children: oneOfType([arrayOf(element), element]),
    className: string,
    disable: bool,
    html: bool,
    place: string
  };

  static defaultProps = {
    inline: false,
    style: {},
    className: '',
    disable: false,
    html: false,
    place: 'top'
  }

  tooltipId = id()

  render() {
    const { inline, style, text, children, disable, place, html, className} = this.props;
    const SpanOrDiv = inline ? 'span' : 'div';

    return (
      <SpanOrDiv>
        <SpanOrDiv data-tip={text} data-for={this.tooltipId}>
          {children}
        </SpanOrDiv>
        <SpanOrDiv style={style}>
          <ReactTooltip id={this.tooltipId} {...{className, disable, html, place}} />
        </SpanOrDiv>
      </SpanOrDiv>
    );
  }
}
