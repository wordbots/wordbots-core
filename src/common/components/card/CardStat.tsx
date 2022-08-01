import { capitalize, isNumber } from 'lodash';
import Icon from '@material-ui/core/Icon';
import * as React from 'react';

import * as w from '../../types';
import Tooltip from '../Tooltip';

interface CardStatProps {
  type: w.Attribute
  base?: number
  current?: number
  scale?: number
  noTooltip?: boolean
  style?: React.CSSProperties
}

export default class CardStat extends React.Component<CardStatProps> {
  get iconClass(): string {
    const { type } = this.props;
    switch (type) {
      case 'attack':
        return 'crossed-swords';
      case 'speed':
        return 'shoe-prints';
      case 'health':
        return 'health';
      default:
        throw new Error(`Unexpected icon type: ${type}`);
    }
  }

  get textColor(): string {
    const { base, current } = this.props;
    if (isNumber(current) && isNumber(base) && current > base) {
      return '#81C784';
    } else if (isNumber(current) && isNumber(base) && current < base) {
      return '#E57373';
    } else {
      return '#444';
    }
  }

  get icon(): JSX.Element {
    return (
      <Icon
        className={`ra ra-${this.iconClass}`}
        style={{
          fontSize: 14 * (this.props.scale || 1),
          color: this.textColor,
          marginRight: 4 * (this.props.scale || 1),
          lineHeight: 1.2
        }}
      />
    );
  }

  get statText(): JSX.Element {
    const { base, current, scale } = this.props;
    const baseStatStyle: React.CSSProperties = {
      position: 'absolute',
      top: -5,
      left: -10,
      color: 'black',
      fontSize: 10 * (scale || 1),
      textDecoration: 'line-through'
    };

    if (current && current !== base) {
      return (
        <span style={{position: 'relative'}}>
          <span style={baseStatStyle}>
            &nbsp;{base}&nbsp;
          </span>
          {current}
        </span>
      );
    } else {
      return <span>{this.props.base}</span>;
    }
  }

  public render(): JSX.Element {
    const style: React.CSSProperties = {
      float: 'left',
      width: '33%',
      lineHeight: '14px',
      color: this.textColor,
      fontFamily: '"Carter One", "Carter One-fallback"',
      fontSize: 18 * (this.props.scale || 1),
      textAlign: 'center',
      paddingBottom: 6 * (this.props.scale || 1),
      ...this.props.style
    };

    if (this.props.noTooltip) {
      return (
        <div style={style}>
          {this.icon}
          {this.statText}
        </div>
      );
    } else {
      return (
        <Tooltip text={capitalize(this.props.type)}>
          <div style={{...style, cursor: 'pointer'}}>
            {this.icon}
            {this.statText}
          </div>
        </Tooltip>
      );
    }
  }
}
