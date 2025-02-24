import { isUndefined, times, uniq } from 'lodash';
import * as React from 'react';

import { ANIMATION_TIME_MS, EFFECT_ICONS, TYPE_CORE } from '../../constants';

import Hex from './Hex';
import HexUtils from './HexUtils';
import Layout from './Layout';
import PiecePattern from './PiecePattern';
import Point from './Point';
import { Actions, PieceOnBoard } from './types';

interface HexPieceProps {
  hex: Hex
  layout: Layout
  actions: Actions
  piece: PieceOnBoard
}

// Coordinates of effect icon "slots", starting from the first (alphabetically last) effect icon.
const PIECE_EFFECT_SLOT_COORDS = [
  [0, -5.5],
  [2, -4.5],
  [-2, -4.5],
  [6, -2.5],
  [4, -3.5],
  [-4, -3.5],
  [-6, -2.5],
  [8, -1.5],
  [-8, -1.5],
];

export default class HexPiece extends React.Component<HexPieceProps> {
  // actual hex coords of the piece
  get points(): string {
    const points: Point[] = this.props.layout.getPolygonPoints(this.props.hex);
    points[4].y = points[4].y + 2;
    points[5].y = points[5].y + 2;
    return points.map((point) => `${point.x},${point.y - 2}`).join(' ');
  }

  // Exact hex coords of the underlying polygon - used for rendering red tint indicating pieces being damaged
  get rawHexCoords(): string {
    const points: Point[] = this.props.layout.getPolygonPoints(this.props.hex);
    return points.map((point) => `${point.x},${point.y}`).join(' ');
  }

  get translate(): string {
    const attackingHex = this.props.piece.attacking ? HexUtils.IDToHex(this.props.piece.attacking) : null;
    const renderedHex = attackingHex ? HexUtils.lerp(this.props.hex, attackingHex, 0.8) : this.props.hex;
    const pixel = HexUtils.hexToPixel(renderedHex, this.props.layout);
    return `translate(${pixel.x}, ${pixel.y})`;
  }

  get styles(): React.CSSProperties {
    const { id } = this.props.piece;
    return {
      fill: `url(#${id}-pattern)`,
      stroke: 'none'
    };
  }

  public render(): JSX.Element {
    const { piece } = this.props;
    return (
      <g
        transform={this.translate}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onClick={this.handleClick}
        style={{
          transition: `transform ${ANIMATION_TIME_MS}ms ease-in-out, opacity ${ANIMATION_TIME_MS}ms ease-in-out`
        }}
      >
        <PiecePattern piece={piece} />
        {piece.isDamaged &&
          <polygon key="p2tint" points={this.rawHexCoords} className="piece-tint-damage" />
        }
        <polygon
          key="p2"
          points={this.points}
          style={this.styles}
          className={`hex-piece ${piece.type === TYPE_CORE && 'kernel'} ${piece.isDamaged && 'piece-damage'}`}
        />
        {this.renderPieceStats()}
        {this.renderPieceEffects()}
      </g>
    );
  }

  private handleMouseEnter = (evt: React.MouseEvent<any>) => this.props.actions.onHexHover(this.props.hex, evt);
  private handleMouseLeave = (evt: React.MouseEvent<any>) => this.props.actions.onHexHover(this.props.hex, evt);
  private handleClick = (evt: React.MouseEvent<any>) => this.props.actions.onClick(this.props.hex, evt);

  private renderPieceStats(): React.ReactNode {
    const stats = this.props.piece.stats;
    if (stats && !isUndefined(stats.speed) && !isUndefined(stats.attack)) {
      return [this.renderStat('attack'), this.renderSpeedStat(), this.renderStat('health')];
    } else if (stats && !isUndefined(stats.speed)) {
      return [this.renderSpeedStat(), this.renderStat('health')];
    } else if (stats && !isUndefined(stats.health)) {
      return this.renderStat('health');
    } else {
      return null;
    }
  }

  private renderStat(stat: 'health' | 'attack'): JSX.Element {
    const value = this.props.piece.stats[stat];
    const isLargeNumber = value && value >= 20;

    const xPos = { attack: -3, health: 3 }[stat];
    const textStyle = {
      fontFamily: '"Carter One", "Carter One-fallback"',
      fontSize: isLargeNumber ? '0.14em' : '0.18em',
      fill: '#FFFFFF',
      fillOpacity: 1
    };
    const circleStyle = {
      fill: { attack: '#E57373', health: '#81C784' }[stat],
      strokeWidth: 0.2,
      stroke: '#777'
    };

    return (
      <g key={stat}>
        <circle cx={xPos} cy="2" r="2" style={circleStyle} filter="url(#dropShadow)" />
        <text x={xPos} y={isLargeNumber ? 2.8 : 3} textAnchor="middle" style={textStyle}>
          {value}
        </text>
      </g>
    );
  }

  private renderSpeedStat(): JSX.Element | null {
    const { movesUsed, movesAvailable } = this.props.piece.stats;

    if (movesUsed === undefined || movesAvailable === undefined) {
      return null;
    }

    const wrapperStyle: React.CSSProperties = {
      fontSize: 10,
      letterSpacing: -1,
      pointerEvents: 'none'
    };
    const movesUsedStyle = { fillOpacity: 0.2 };
    const movesAvailableStyle = { fillOpacity: 0.7 };

    const movesUsedDots = <tspan key="moves-used" style={movesUsedStyle}>{times(movesUsed, () => '.').join('')}</tspan>;
    const movesAvailableDots = <tspan key="moves-available" style={movesAvailableStyle}>{times(movesAvailable, () => '.').join('')}</tspan>;

    return (
      <g key="speed">
        <text x="0" y="6" textAnchor="middle" style={wrapperStyle}>{movesAvailableDots}{movesUsedDots}</text>
      </g>
    );
  }


  private renderPieceEffects = (): JSX.Element => (
    <g>
      {
        // Note that we reverse-sort the effects, just so Taunt is always at the top of the hierarchy (if present).
        uniq(this.props.piece.effects).sort().reverse().map((effectName, idx) => {
          const { icon, description } = EFFECT_ICONS[effectName];
          const [x, y] = PIECE_EFFECT_SLOT_COORDS[idx];
          return (
            <text key={effectName} x={x} y={y} textAnchor="middle" style={{ fontSize: '0.12em' }} className="ra">
              {icon}
              <title>{description}</title>
            </text>
          );
        })
      }
    </g>
  );
}
