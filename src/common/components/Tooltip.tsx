import * as React from 'react';
import * as ReactTooltip from 'react-tooltip';

import { id } from '../util/common';

interface TooltipProps {
  inline?: boolean
  style?: React.CSSProperties
  text: string
  children: React.ReactNode
  className?: string
  disable?: boolean
  html?: boolean
  place?: string
  additionalStyles?: React.CSSProperties
}

interface TooltipState {
  tooltipId: string
}

export default class Tooltip extends React.Component<TooltipProps, TooltipState> {
  public state = {
    tooltipId: id()
  };

  public render(): JSX.Element {
    const { inline, style, text, children, disable, place, html, className, additionalStyles} = this.props;
    const { tooltipId } = this.state;
    const SpanOrDiv = inline ? 'span' : 'div';

    return (
      <SpanOrDiv>
        <SpanOrDiv data-tip={text} data-for={tooltipId} style={additionalStyles}>
          {children}
        </SpanOrDiv>
        <SpanOrDiv style={style}>
          <ReactTooltip
            id={tooltipId}
            className={className || ''}
            place={place || 'top'}
            disable={disable || false}
            html={html || false}
          />
        </SpanOrDiv>
      </SpanOrDiv>
    );
  }
}
