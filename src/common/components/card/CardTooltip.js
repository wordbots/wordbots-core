import React, { Component } from 'react';
import { array, bool, object, oneOfType } from 'prop-types';
import Popover from 'react-popover';
import ReactTooltip from 'react-tooltip';

import { id } from '../../util/common';

import Card from './Card';

export default class CardTooltip extends Component {
  static propTypes = {
    card: object,
    children: oneOfType([array, object]),
    popover: bool,
    isOpen: bool
  };

  tooltipId = id()

  render() {
    if (!this.props.card) {
      return this.props.children;
    } else if (this.props.popover) {
      return (
        <Popover
          isOpen={this.props.isOpen}
          style={{zIndex: 99999}}
          tipSize={0.01}
          body={Card.fromObj(this.props.card)}
          refreshIntervalMs={50}
          place="above"
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
          <span style={{zIndex: 99999, backgroundColor: 'transparent'}}>
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
