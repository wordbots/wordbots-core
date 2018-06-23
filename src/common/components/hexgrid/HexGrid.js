import * as React from 'react';
import { arrayOf, bool, number, string, object } from 'prop-types';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { chain as _ } from 'lodash';

import { ANIMATION_TIME_MS } from '../../constants';

import GridGenerator from './GridGenerator';
import HexPiece from './HexPiece';
import HexShape from './HexShape';
import HexUtils from './HexUtils';
import Layout from './Layout';

export default class HexGrid extends React.Component {
  static propTypes = {
    width: number.isRequired,
    height: number.isRequired,
    actions: object.isRequired,
    layout: object.isRequired,
    hexagons: arrayOf(object).isRequired,
    tutorialStep: object,
    activatedAbilities: arrayOf(object),
    hexColors: object,
    pieces: object,
    selectedHexId: string,
    hoveredHexId: string,
    isGameOver: bool
  };

  static defaultProps = {
    width: 800,
    height: 600
  };

  static generate(config, content) {
    const layout = new Layout(config.layout, config.origin);
    const generator = GridGenerator.getGenerator(config.map);
    const hexagons = generator.apply(this, config.mapProps);

    return { hexagons, layout };
  }

  get selectedHex() {
    return this.props.hexagons.find(hex => HexUtils.getID(hex) === this.props.selectedHexId);
  }

  renderHexes() {
    return this.props.hexagons.map((hex, index) => (
      <HexShape
        key={index}
        hex={hex}
        card={(this.props.pieces[HexUtils.getID(hex)] || {}).card}
        layout={this.props.layout}
        actions={this.props.actions}
        fill={this.props.hexColors[HexUtils.getID(hex)]}
        tutorialStep={this.props.tutorialStep}
        hovered={this.props.hoveredHexId === HexUtils.getID(hex)}
        isGameOver={this.props.isGameOver} />
    ));
  }

  renderPieces() {
    return (
      <TransitionGroup component="g">
        {
          _(this.props.pieces)
            .toPairs()
            .sortBy(([hex, piece]) => piece.id)
            .map(([hex, piece]) => (
              <CSSTransition
                key={piece.id}
                classNames="hex-piece"
                timeout={ANIMATION_TIME_MS}
              >
                <HexPiece
                  hex={HexUtils.IDToHex(hex)}
                  layout={this.props.layout}
                  actions={this.props.actions}
                  piece={piece} />
              </CSSTransition>
            ))
            .value()
        }
      </TransitionGroup>
    );
  }

  renderSelectedHex() {
    const { actions, activatedAbilities, layout, tutorialStep } = this.props;
    const selectedHexes = [];

    if (tutorialStep && tutorialStep.highlight && tutorialStep.tooltip && tutorialStep.tooltip.hex) {
      selectedHexes.push(
        <HexShape
          key="tutorialStep"
          selected
          hex={HexUtils.IDToHex(tutorialStep.tooltip.hex)}
          layout={layout}
          actions={actions} />
      );
    }

    if (this.selectedHex) {
      selectedHexes.push(
        <HexShape
          key="selectedByUser"
          selected
          hex={this.selectedHex}
          layout={layout}
          actions={actions}
          activatedAbilities={activatedAbilities} />
      );
    }

    return selectedHexes;
  }

  render() {
    return (
      <svg
        className="grid background"
        width={this.props.width}
        height={this.props.height}
        viewBox="-50 -50 100 100"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        {this.renderHexes()}
        {this.renderPieces()}
        {this.renderSelectedHex()}
        <defs>
          <filter id="dropShadow" width="5" x="-1" height="5" y="-1">
            <feOffset in="SourceAlpha" dx="0.5" dy="0.5" result="offset"/>
            <feGaussianBlur in="offset" stdDeviation="0.5" result="blur"/>
            <feFlood floodColor="#3D4574" floodOpacity="0.5" result="offsetColor"/>
            <feComposite in="offsetColor" in2="blur" operator="in" result="blended"/>
            <feBlend in="SourceGraphic" in2="blended" />
          </filter>
        </defs>
      </svg>
    );
  }
}
