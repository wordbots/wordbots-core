import Badge from 'material-ui/Badge';
import * as React from 'react';

import { inBrowser } from '../../util/browser';

interface CardCostBadgeProps {
  children: JSX.Element
  cost: number
  baseCost: number
  scale: number
  margin: number
  zIndex: number
  transform: string
}

export default class CardCostBadge extends React.Component<CardCostBadgeProps> {
  get badgeContent(): JSX.Element {
    return (
      <div style={this.badgeContentStyle}>
        {this.props.cost}
      </div>
    );
  }

  get badgeContentStyle(): React.CSSProperties {
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

  get badgeContainerStyle(): React.CSSProperties {
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
      return {
        ...baseStyle,
        color: '#81C784',
        WebkitTextStroke: '1px white'
      };
    } else if (this.props.cost > this.props.baseCost) {
      return {
        ...baseStyle,
        color: '#E57373',
        WebkitTextStroke: '1px white'
      };
    } else {
      return baseStyle;
    }
  }

  get rootStyle(): React.CSSProperties {
    return {
      paddingLeft: 0,
      paddingRight: 0,
      marginRight: this.props.margin,
      zIndex: this.props.zIndex || 0,
      transform: this.props.transform
    };
  }

  public render(): JSX.Element {
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
