import React, { Component } from 'react';
import { bool, number, string } from 'prop-types';
import Paper from 'material-ui/Paper';
import FontIcon from 'material-ui/FontIcon';
import { capitalize } from 'lodash';

import { inBrowser } from '../../util/browser';
import Tooltip from '../Tooltip';

export default class CardStat extends Component {
  static propTypes = {
    type: string,
    base: number,
    current: number,
    scale: number,
    noTooltip: bool
  };

  static defaultProps = {
    scale: 1
  };

  get iconClass() {
    switch (this.props.type) {
      case 'attack':
        return 'crossed-swords';
      case 'speed':
        return 'shoe-prints';
      case 'health':
        return 'health';
    }
  }

  get textColor() {
    if (this.props.current && this.props.current > this.props.base) {
      return '#81C784';
    } else if (this.props.current && this.props.current < this.props.base) {
      return '#E57373';
    } else {
      return '#444';
    }
  }

  get icon() {
    return (
      <FontIcon
        className={`ra ra-${this.iconClass}`}
        style={{
          fontSize: 14 * this.props.scale,
          color: this.textColor,
          marginRight: 4 * this.props.scale
        }} />
    );
  }

  get statText() {
    const baseStatStyle = {
      position: 'absolute',
      top: -5,
      left: -10,
      color: 'black',
      fontSize: 10 * this.props.scale,
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
      return this.props.base;
    }
  }

  render() {
    return inBrowser() ? this.renderNewStyle() : this.renderOldStyle();
  }

  renderNewStyle() {
    const style = {
      float: 'left',
      width: '33%',
      lineHeight: '14px',
      color: this.textColor,
      fontFamily: 'Carter One',
      fontSize: 18 * this.props.scale,
      textAlign: 'center',
      paddingBottom: 6 * this.props.scale
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

  renderOldStyle() {
    function backgroundColor(type) {
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
        <Paper circle
          zDepth={1}
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
        }}>
          <span style={{color: '#fff'}}>
            {this.props.current || this.props.base}
          </span>
        </Paper>
      </div>
    );
  }
}
