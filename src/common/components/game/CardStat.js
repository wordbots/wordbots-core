import React, { Component } from 'react';
import { number, string } from 'prop-types';
import Paper from 'material-ui/Paper';
import ReactTooltip from 'react-tooltip';

import { id, toProperCase } from '../../util/common';

export default class CardStat extends Component {
  static propTypes = {
    type: string,
    base: number,
    current: number,
    scale: number
  };

  render() {
    const tooltipId = id();
    let backgroundColor = '';
    let textColor = 'white';
    let webkitTextStroke = 'none';

    switch (this.props.type) {
      case 'attack':
        backgroundColor = '#E57373';
        break;
      case 'speed':
        backgroundColor = '#03A9F4';
        break;
      case 'health':
        backgroundColor = '#81C784';
        break;
    }

    if (this.props.current) {
      if (this.props.current > this.props.base) {
        textColor = '#81C784';
        webkitTextStroke = '1px white';
      } else if (this.props.current < this.props.base) {
        textColor = '#E57373';
        webkitTextStroke = '1px white';
      } else {
        textColor = 'white';
      }
    }

    return (
      <div>
        <Paper circle
          zDepth={1}
          data-for={tooltipId}
          data-tip={toProperCase(this.props.type)}
          style={{
            width: 32 * (this.props.scale || 1),
            height: 32 * (this.props.scale || 1),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: backgroundColor,
            color: '#fff',
            fontFamily: 'Carter One',
            fontSize: 22 * (this.props.scale || 1)
        }}>
          <ReactTooltip id={tooltipId} />
          <div style={{
            lineHeight: '14px',
            WebkitTextStroke: webkitTextStroke,
            color: textColor
          }}>{this.props.current || this.props.base}</div>
        </Paper>
      </div>
    );
  }
}
