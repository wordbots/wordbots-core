import React, {Component} from 'react';
import {element, number, string} from 'prop-types';
import Badge from 'material-ui/Badge';

import {inBrowser} from '../../util/browser';

export default class CardCostBadge extends Component {
  static propTypes = {
    children: element,
    cost: number,
    baseCost: number,
    scale: number,
    margin: number,
    zIndex: number,
    transform: string
  };

  get badgeContent() {
    return <div style={this.badgeContentStyle}>{this.props.cost}</div>;
  }

  get badgeContentStyle() {
    if (inBrowser()) {
      return {};
    } else {
      return {
        paddingTop: 8,
        textAlign: 'center',
        fontFamily: 'Carter One, Arial',
        fontWeight: 'bold'
      };
    }
  }

  get badgeContainerStyle() {
    const baseStyle = {
      top: 12,
      right: -4,
      width: 36 * this.props.scale,
      height: 36 * this.props.scale,
      backgroundColor: '#00bcd4',
      fontFamily: 'Carter One',
      color: 'white',
      fontSize: 16 * this.props.scale
    };

    if (this.props.cost < this.props.baseCost) {
      return Object.assign(baseStyle, {
        color: '#81C784',
        WebkitTextStroke: '1px white'
      });
    } else if (this.props.cost > this.props.baseCost) {
      return Object.assign(baseStyle, {
        color: '#E57373',
        WebkitTextStroke: '1px white'
      });
    } else {
      return baseStyle;
    }
  }

  get rootStyle() {
    return {
      paddingLeft: 0,
      paddingRight: 0,
      marginRight: this.props.margin,
      zIndex: this.props.zIndex || 0,
      transform: this.props.transform
    };
  }

  render() {
    return (
      <Badge
        badgeContent={this.badgeContent}
        badgeStyle={this.badgeContainerStyle}
        style={this.rootStyle}
      >
        {this.props.children}
      </Badge>
    );
  }
}
