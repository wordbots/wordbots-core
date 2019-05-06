/* tslint:disable no-http-string */  // tslint-disable no-single-line-block-comment

import { chain as _ } from 'lodash';
import * as React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { ANIMATION_TIME_MS } from '../../constants';
import * as w from '../../types';

import GridGenerator from './GridGenerator';
import Hex from './Hex';
import HexPiece from './HexPiece';
import HexShape from './HexShape';
import HexUtils from './HexUtils';
import Layout from './Layout';
import { Actions, GridConfig, PieceOnBoard } from './types';

interface HexShapeProps {
  width: number
  height: number
  actions: Actions
  layout: Layout
  hexagons: Hex[]
  pieces: Record<w.HexId, PieceOnBoard>
  hexColors: Record<w.HexId, string>

  tutorialStep?: w.TutorialStep
  activatedAbilities?: w.ActivatedAbility[]
  selectedHexId?: w.HexId
  hoveredHexId?: w.HexId
  isGameOver?: boolean
}

export default class HexGrid extends React.Component<HexShapeProps> {
  public static generate(config: GridConfig): { hexagons: Hex[], layout: Layout } {
    const layout = new Layout(config.layout, config.origin);
    const generator: w.Returns<Hex[]> = GridGenerator.getGenerator(config.map)!;
    const hexagons = generator.apply(this, config.mapProps);

    return { hexagons, layout };
  }

  get selectedHex(): Hex | undefined {
    const { hexagons, selectedHexId } = this.props;
    if (selectedHexId !== undefined) {
      return hexagons.find((hex) => HexUtils.getID(hex) === selectedHexId);
    }
  }

  public render(): JSX.Element {
    return (
      <svg
        className="grid background"
        width={this.props.width || 800}
        height={this.props.height || 600}
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

  private renderHexes(): JSX.Element[] {
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
        isGameOver={this.props.isGameOver}
      />
    ));
  }

  private renderPieces(): JSX.Element {
    return (
      <TransitionGroup component="g">
        {
          _(this.props.pieces)
            .toPairs()
            .sortBy(([_hex, piece]) => piece.id)
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
                  piece={piece}
                />
              </CSSTransition>
            ))
            .value()
        }
      </TransitionGroup>
    );
  }

  private renderSelectedHex(): JSX.Element[] {
    const { actions, activatedAbilities, layout, tutorialStep } = this.props;
    const selectedHexes = [];

    if (tutorialStep && tutorialStep.highlight && tutorialStep.tooltip && tutorialStep.tooltip.hex) {
      selectedHexes.push(
        <HexShape
          key="tutorialStep"
          selected
          hex={HexUtils.IDToHex(tutorialStep.tooltip.hex)}
          layout={layout}
          actions={actions}
        />
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
          activatedAbilities={activatedAbilities}
        />
      );
    }

    return selectedHexes;
  }
}
