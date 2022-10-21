import Badge from '@material-ui/core/Badge';
import * as React from 'react';

import Tooltip from '../Tooltip';

interface CardCostBadgeProps {
  children: JSX.Element
  cost: number
  baseCost: number
  scale: number
}

export default class CardCostBadge extends React.Component<CardCostBadgeProps> {
  get badgeContent(): JSX.Element {
    return (
      <div style={this.badgeStyle}>
        <Tooltip text="Cost" place="left" className="card-part-tooltip">
          <div style={{ lineHeight: 2.4, userSelect: 'none' }}>
            {this.props.cost}
          </div>
        </Tooltip>
      </div>
    );
  }

  get badgeStyle(): React.CSSProperties {
    const baseStyle: React.CSSProperties = {
      position: 'relative',
      top: 6 * this.props.scale,
      right: 14 * this.props.scale,
      width: 36 * this.props.scale,
      height: 36 * this.props.scale,
      backgroundColor: '#00bcd4',
      fontFamily: 'Carter One, Arial',
      color: 'white',
      fontSize: 16 * this.props.scale,
      textAlign: 'center',
      fontWeight: 500,
      borderRadius: '50%',
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

  public render(): JSX.Element {
    return (
      <Badge badgeContent={this.badgeContent}>
        {this.props.children}
      </Badge>
    );
  }
}
