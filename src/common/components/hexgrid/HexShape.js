import React from 'react';
import { bool, object, string } from 'prop-types';

import { DISPLAY_HEX_IDS } from '../../constants';
import TutorialTooltip from '../game/TutorialTooltip';

import FillPattern from './FillPattern';
import HexUtils from './HexUtils';

export default class HexShape extends React.Component {
  static propTypes = {
    hex: object.isRequired,
    layout: object.isRequired,
    actions: object.isRequired,
    tutorialStep: object,
    fill: string,
    selected: bool
  };

  get points() {
    const points = this.props.layout.getPolygonPoints(this.props.hex);
    return points.map(point => `${point.x},${point.y}`).join(' ');
  }

  get translate() {
    const hex = this.props.hex;
    const pixel = HexUtils.hexToPixel(hex, this.props.layout);
    return `translate(${pixel.x}, ${pixel.y})`;
  }

  get hexStyles() {
    const hex = this.props.hex;

    if (this.props.selected) {
      return {
        stroke: '#666',
        strokeWidth: 0.6,
        fillOpacity: 0
      };
    } else {
      return {
        fill: `url(#${HexUtils.getID(hex)})`
      };
    }
  }

  get shouldRenderTooltip() {
    return this.props.tutorialStep && (HexUtils.getID(this.props.hex) === this.props.tutorialStep.tooltip.hex);
  }

  renderPattern() {
    if (!this.props.selected) {
      return (
        <FillPattern
          hex={this.props.hex}
          fill={this.props.fill} />
      );
    } else {
      return null;
    }
  }

  renderText() {
    if (DISPLAY_HEX_IDS) {
      return <text x="0" y="0.3em" textAnchor="middle">{HexUtils.getID(this.props.hex) || ''}</text>;
    }
  }

  renderHex() {
    return (
      <g
        draggable
        transform={this.translate}
        onMouseEnter={e => this.props.actions.onHexHover(this.props.hex, e)}
        onMouseLeave={e => this.props.actions.onHexHover(this.props.hex, e)}
        onClick={e => this.props.actions.onClick(this.props.hex, e)}
      >
        {this.renderPattern()}
        <polygon key="p1" points={this.points} style={this.hexStyles} />
        {this.renderText()}
      </g>
    );
  }

  render() {
    if (this.shouldRenderTooltip) {
      return (
        <TutorialTooltip
          tutorialStep={this.props.tutorialStep}
          onNextStep={() => { this.props.actions.onTutorialStep(false); }}
          onPrevStep={() => { this.props.actions.onTutorialStep(true); }}
          onEndTutorial={this.props.actions.onEndGame}
        >
          {this.renderHex()}
        </TutorialTooltip>
      );
    } else {
      return this.renderHex();
    }
  }
}
