import React, { Component } from 'react';
import { array, object, oneOfType } from 'prop-types';
import ReactTooltip from 'react-tooltip';

import { id } from '../../util/common';

export default class CardTooltip extends Component {
  static propTypes = {
    card: object,
    children: oneOfType([array, object])
  };

  tooltipId = id()

  render() {
    return (
      <div>
        <div data-tip="" data-for={this.tooltipId}>
          {this.props.children}
        </div>
        <div style={{zIndex: 99999, backgroundColor: 'transparent'}}>
          <ReactTooltip
            id={this.tooltipId}
            className="hovered-card"
            offset={{bottom: 20}}
            place="top"
          >
            {this.props.card}
          </ReactTooltip>
        </div>
      </div>
    );
  }
}
