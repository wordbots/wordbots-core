import React, { Component } from 'react';
import { func, number, object, string } from 'prop-types';
import { forOwn, intersection, isString, mapValues } from 'lodash';

import HexGrid from '../react-hexgrid/HexGrid';
import HexUtils from '../react-hexgrid/HexUtils';
import { TYPE_ROBOT, TYPE_STRUCTURE, GRID_CONFIG } from '../../constants';
import {
  getAttribute, ownerOf,
  getAdjacentHexes, validPlacementHexes, validMovementHexes, validAttackHexes, validActionHexes
} from '../../util/game';

export default class Board extends Component {
  static propTypes = {
    bluePieces: object,
    orangePieces: object,

    player: string,
    currentTurn: string,
    selectedTile: string,
    playingCardType: number,
    target: object,
    size: number,
    tooltip: object,

    onSelectTile: func,
    onHoverTile: func
  };

  constructor(props) {
    super(props);

    const boardConfig = GRID_CONFIG;
    const grid = HexGrid.generate(boardConfig);

    this.state = {
      grid,
      config: boardConfig
    };
  }

  // Many util functions require a game state object, so we create a dummy one with minimal data.
  // TODO find a less gross approach?
  get dummyGameState() {
    return {
      players: {
        blue: {name: 'blue', robotsOnBoard: this.props.bluePieces},
        orange: {name: 'orange', robotsOnBoard: this.props.orangePieces}
      }
    };
  }

  get isMyTurn() {
    return this.props.currentTurn === this.props.player;
  }

  get playingAnObject() {
    return this.props.playingCardType === TYPE_ROBOT || this.props.playingCardType === TYPE_STRUCTURE;
  }

  get currentPlayerPieces() {
    return (this.props.currentTurn === 'blue' ? this.props.bluePieces : this.props.orangePieces);
  }

  get allPieces() {
    return Object.assign({}, this.props.bluePieces, this.props.orangePieces);
  }

  get pieceImages() {
    return mapValues(this.allPieces, piece =>
      piece.card.img ? {img: piece.card.img} : {sprite: piece.card.spriteID || piece.card.name}
    );
  }

  get pieceStats() {
    return mapValues(this.allPieces, piece => ({
      health: getAttribute(piece, 'health'),
      attack: getAttribute(piece, 'attack')
    }));
  }

  get selectedHexId() { return this.props.selectedTile; }
  get selectedHex() { return HexUtils.IDToHex(this.selectedHexId); }
  get selectedPiece() { return this.currentPlayerPieces[this.selectedHexId]; }

  get placementHexes() {
    return validPlacementHexes(this.dummyGameState, this.props.currentTurn, this.props.playingCardType);
  }

  get hexColors() {
    const hexColors = {};

    function color(hexes, colorName) {
      hexes.forEach(hex => {
        hexColors[isString(hex) ? hex : HexUtils.getID(hex)] = colorName;
      });
    }

    forOwn(this.allPieces, (piece, hex) => {
      const owner = ownerOf(this.dummyGameState, piece).name;
      const canMove = (owner === this.props.currentTurn) && this.hasValidActions(HexUtils.IDToHex(hex));
      color([hex], `${canMove ? 'bright_' : ''}${owner}`);
    });

    if (this.isMyTurn) {
      if (this.props.target.choosing) {
        color(this.props.target.possibleHexes, 'green');
      } else if (this.playingAnObject) {
        color(this.placementHexes, 'green');
      } else if (this.selectedPiece) {
        color(this.getValidMovementHexes(this.selectedHex), 'green');
        color(this.getValidAttackHexes(this.selectedHex), 'red');
      }
    }

    return hexColors;
  }

  getValidMovementHexes(startHex) {
    return validMovementHexes(this.dummyGameState, startHex);
  }
  getValidAttackHexes(startHex) {
    return validAttackHexes(this.dummyGameState, startHex);
  }
  hasValidActions(startHex) {
    return validActionHexes(this.dummyGameState, startHex).length > 0;
  }

  onHexClick(hex) {
    const hexId = HexUtils.getID(hex);

    if (this.isMyTurn) {
      if (this.playingAnObject && this.placementHexes.map(HexUtils.getID).includes(hexId)) {
        this.props.onSelectTile(hexId, 'place');
      } else if (this.selectedPiece) {
        this.onMoveOrAttack(hex);
      } else {
        this.props.onSelectTile(hexId);
      }
    } else {
      this.props.onSelectTile(hexId);
    }
  }

  onMoveOrAttack(hex) {
    const hexId = HexUtils.getID(hex);
    const adjacentHexIds = getAdjacentHexes(hex).map(HexUtils.getID);
    const movementHexIds = this.getValidMovementHexes(this.selectedHex).map(HexUtils.getID);
    const attackHexIds = this.getValidAttackHexes(this.selectedHex).map(HexUtils.getID);

    if (movementHexIds.includes(hexId)) {
      this.props.onSelectTile(hexId, 'move');
    } else if (attackHexIds.includes(hexId)) {
      if (adjacentHexIds.includes(this.selectedHexId)) {
        // Attack destination is adjacent to current position, so we can attack directly.
        this.props.onSelectTile(hexId, 'attack');
      } else {
        // Attack destination is not adjacent to current position, so we need an intermediate move action.
        // Since attackHexIds.includes(hexId), we're guaranteed that there's at least one valid intermediate hex.
        this.props.onSelectTile(hexId, 'attack', intersection(movementHexIds, adjacentHexIds)[0]);
      }
    } else {
      this.props.onSelectTile(hexId);
    }
  }

  onHexHover(hex, event) {
    this.props.onHoverTile(HexUtils.getID(hex), event.type);
  }

  render() {
    const { grid } = this.state;

    return (
      <div id="hexgrid">
        <HexGrid
          hexColors={this.hexColors}
          pieceImgs={this.pieceImages}
          pieceStats={this.pieceStats}
          width={this.props.size}
          height={this.props.size}
          hexagons={grid.hexagons}
          layout={grid.layout}
          selectedHexId={this.selectedHexId}
          tooltip={this.props.tooltip}
          actions={{
            onClick: this.onHexClick.bind(this),
            onHexHover: this.onHexHover.bind(this)
          }} />
      </div>
    );
  }
}
