import * as React from 'react';
import * as ReactTooltip from 'react-tooltip';

import { MAX_Z_INDEX } from '../../constants';
import * as w from '../../types';
import { id } from '../../util/common';
import Popover from '../Popover';

import { Card } from './Card';

interface CardTooltipProps {
  card: w.CardInStore
  children: JSX.Element | JSX.Element[]
  popover?: boolean
  isOpen?: boolean
}

export default class CardTooltip extends React.Component<CardTooltipProps> {
  private tooltipId = id();

  public render(): JSX.Element | JSX.Element[] {
    if (!this.props.card) {
      return this.props.children;
    } else if (this.props.popover) {
      return (
        <Popover
          isOpen={this.props.isOpen}
          body={Card.fromObj(this.props.card)}
          style={{ zIndex: MAX_Z_INDEX }}
          preferPlace="above"
          showTip={false}
        >
          {this.props.children}
        </Popover>
      );
    } else {
      return (
        <span>
          <span data-tip="" data-for={this.tooltipId}>
            {this.props.children}
          </span>
          <span style={{ zIndex: MAX_Z_INDEX, backgroundColor: 'transparent' }}>
            <ReactTooltip
              id={this.tooltipId}
              className="hovered-card"
              place="top"
            >
              {Card.fromObj(this.props.card)}
            </ReactTooltip>
          </span>
        </span>
      );
    }
  }
}
