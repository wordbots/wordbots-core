import Paper from '@material-ui/core/Paper';
import { capitalize } from 'lodash';
import FontIcon from 'material-ui/FontIcon';
import * as React from 'react';

import * as w from '../../types';
import { inBrowser } from '../../util/browser';
import Tooltip from '../Tooltip';

interface CardStatProps {
  type: w.Attribute
  base?: number
  current?: number
  scale?: number
  noTooltip?: boolean
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
    if (current && base && current > base) {
      return '#81C784';
    } else if (current && base && current < base) {
      return '#E57373';
    } else {
      return '#444';
    }
  }

  get icon(): JSX.Element {
    return (
      <FontIcon
        className={`ra ra-${this.iconClass}`}
        style={{
          fontSize: 14 * (this.props.scale || 1),
          color: this.textColor,
          marginRight: 4 * (this.props.scale || 1)
        }}
      />
    );
  }

  get statText(): JSX.Element {
    const baseStatStyle: React.CSSProperties = {
      position: 'absolute',
      top: -5,
      left: -10,
      color: 'black',
      fontSize: 10 * (this.props.scale || 1),
      textDecoration: 'line-through'
    };

    if (this.props.current && this.props.current !== this.props.base) {
      return (
        <span style={{position: 'relative'}}>
          <span style={baseStatStyle}>
            &nbsp;{this.props.base}&nbsp;
          </span>
          {this.props.current}
        </span>
      );
    } else {
      return <span>{this.props.base}</span>;
    }
  }

  public render(): JSX.Element {
    return inBrowser() ? this.renderNewStyle() : this.renderOldStyle();
  }

  private renderNewStyle(): JSX.Element {
    const style: React.CSSProperties = {
      float: 'left',
      width: '33%',
      lineHeight: '14px',
      color: this.textColor,
      fontFamily: 'Carter One',
      fontSize: 18 * (this.props.scale || 1),
      textAlign: 'center',
      paddingBottom: 6 * (this.props.scale || 1)
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
          <div style={Object.assign(style, {cursor: 'pointer'})}>
            {this.icon}
            {this.statText}
          </div>
        </Tooltip>
      );
    }
  }

  private renderOldStyle(): JSX.Element {
    function backgroundColor(type: w.Attribute): string {
      switch (type) {
        case 'attack':
          return '#E57373';
        case 'speed':
          return '#03A9F4';
        case 'health':
          return '#81C784';
      }
    }

    return (
      <div style={{float: 'left', width: '33%'}}>
        <Paper
          elevation={1}
          style={{
            width: 32,
            height: 32,
            backgroundColor: backgroundColor(this.props.type),
            textAlign: 'center',
            fontFamily: 'Carter One, Arial',
            fontWeight: 'bold',
            fontSize: 18,
            margin: 8,
            marginBottom: 4,
            paddingTop: 4
          }}
        >
          <span style={{color: '#fff'}}>
            {this.props.current || this.props.base}
          </span>
        </Paper>
      </div>
    );
  }
}
