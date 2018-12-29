import * as React from 'react';
import { arrayOf, bool, object, oneOfType } from 'prop-types';
import * as ReactTooltip from 'react-tooltip';

import { MAX_Z_INDEX } from '../../constants.ts';
import { id } from '../../util/common.ts';
import Popover from '../Popover';

import Card from './Card';

export default class CardTooltip extends React.Component {
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
          style={{ zIndex: MAX_Z_INDEX }}
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
