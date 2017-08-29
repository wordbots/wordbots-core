import React, {Component} from 'react';
import {array, object, oneOfType} from 'prop-types';
import ReactTooltip from 'react-tooltip';

import {id} from '../../util/common';

import Card from './Card';

export default class CardTooltip extends Component {
  static propTypes = {
    card: object,
    children: oneOfType([ array, object ])
  };

  tooltipId = id();

  render () {
    return (
      <span>
        <span data-tip="" data-for={this.tooltipId}>
          {this.props.children}
        </span>
        <span style={{zIndex: 99999, backgroundColor: 'transparent'}}>
          <ReactTooltip id={this.tooltipId} className="hovered-card" place="top">
            {Card.fromObj(this.props.card)}
          </ReactTooltip>
        </span>
      </span>
    );
  }
}
