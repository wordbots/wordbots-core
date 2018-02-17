import React, { Component } from 'react';
import { arrayOf, bool, object, oneOfType } from 'prop-types';
import ReactTooltip from 'react-tooltip';

import { id } from '../../util/common';
import Popover from '../Popover';

import Card from './Card';

export default class CardTooltip extends Component {
  static propTypes = {
    card: object,
    children: oneOfType([arrayOf(object), object]),
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
          body={Card.fromObj(this.props.card)}
          style={{zIndex: 99999}}
          place="above"
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
