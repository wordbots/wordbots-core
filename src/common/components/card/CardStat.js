import React, { Component } from 'react';
import { number, string } from 'prop-types';
import Paper from 'material-ui/Paper';
import FontIcon from 'material-ui/FontIcon';
import ReactTooltip from 'react-tooltip';
import { capitalize } from 'lodash';

import { id, inBrowser } from '../../util/common';

export default class CardStat extends Component {
  static propTypes = {
    type: string,
    base: number,
    current: number,
    scale: number
  };

  static defaultProps = {
    scale: 1
  };
s
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

  render() {
    return inBrowser() ? this.renderNewStyle() : this.renderOldStyle();
  }

  renderNewStyle() {
    const tooltipId = id();
    return (
      <div
        data-for={tooltipId}
        data-tip={capitalize(this.props.type)}
        style={{
          float: 'left',
          width: '33%',
          lineHeight: '14px',
          color: this.textColor,
          fontFamily: 'Carter One, Arial',
          fontSize: 18 * this.props.scale,
          textAlign: 'center',
          cursor: 'pointer',
          paddingBottom: 6 * this.props.scale
      }}>
        <ReactTooltip id={tooltipId} />
        {this.icon}
        {this.props.current || this.props.base}
      </div>
    );
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
