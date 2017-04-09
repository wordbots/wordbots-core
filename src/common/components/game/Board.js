import React, { Component } from 'react';
import { func, number, object, string } from 'prop-types';
import { forOwn, intersectionBy, mapValues, some } from 'lodash';

import HexGrid from '../react-hexgrid/HexGrid';
import HexUtils from '../react-hexgrid/HexUtils';
import { TYPE_ROBOT, TYPE_STRUCTURE, GRID_CONFIG } from '../../constants';
import {
  getAttribute, movesLeft, allowedToAttack, ownerOf,
  getAdjacentHexes, validPlacementHexes, validMovementHexes, validAttackHexes
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

  isMyTurn() {
    return this.props.currentTurn === this.props.player;
  }

  currentPlayerPieces() {
    return (this.props.currentTurn === 'blue' ? this.props.bluePieces : this.props.orangePieces);
  }

  allPieces() {
    return Object.assign({}, this.props.bluePieces, this.props.orangePieces);
  }

  getValidPlacementHexes() {
    return validPlacementHexes(this.dummyGameState, this.props.currentTurn, this.props.playingCardType);
  }

  getValidMovementHexes(startHex, speed, piece) {
    return validMovementHexes(this.dummyGameState, startHex, speed, piece);
  }

  getValidAttackHexes(startHex, speed, piece) {
    return validAttackHexes(this.dummyGameState, this.props.currentTurn, startHex, speed, piece);
  }

  updateHexColors() {
    let hexColors = {};

    forOwn(this.allPieces(), (piece, hex) => {
      const owner = ownerOf(this.dummyGameState, piece).name;
      const canMove = this.props.currentTurn === owner && movesLeft(piece) > 0;

      hexColors[hex] = `${canMove ? 'bright_' : ''}${owner}`;
    });

    if (this.isMyTurn()) {
      if (this.props.target.choosing) {
        this.props.target.possibleHexes.forEach(hex => {
          hexColors[hex]  = 'green';
        });
      } else if (this.props.selectedTile) {
        const selectedPiece = this.currentPlayerPieces()[this.props.selectedTile];

        if (selectedPiece && movesLeft(selectedPiece) > 0) {
          const hex = HexUtils.IDToHex(this.props.selectedTile);
          hexColors = this.colorMovementHexes(hex, hexColors, movesLeft(selectedPiece));
        }
      } else if (this.props.playingCardType === TYPE_ROBOT || this.props.playingCardType === TYPE_STRUCTURE) {
        this.getValidPlacementHexes().forEach((hex) => {
          hexColors[HexUtils.getID(hex)] = 'green';
        });
      }
    }

    return hexColors;
  }

  colorMovementHexes(hex, hexColors, speed) {
    const selectedPiece = this.currentPlayerPieces()[this.props.selectedTile];
    const newHexColors = Object.assign({}, hexColors);

    const movementHexIds = this.getValidMovementHexes(hex, speed, selectedPiece).map(HexUtils.getID);
    const attackHexIds = this.getValidAttackHexes(hex, speed, selectedPiece).map(HexUtils.getID);

    movementHexIds.forEach(h => { newHexColors[h] = 'green'; });

    attackHexIds
      .filter(h => allowedToAttack(this.dummyGameState, selectedPiece, h))
      .forEach(h => { newHexColors[h] = 'red'; });

    return newHexColors;
  }

  onHexClick(hex, event) {
    if (!this.isMyTurn()) {
      return;
    }

    const hid = HexUtils.getID(hex);
    const selectedPiece = this.currentPlayerPieces()[this.props.selectedTile];

    let action = '';
    let intermediateMoveHex = null;

    if (this.props.playingCardType === TYPE_ROBOT || this.props.playingCardType === TYPE_STRUCTURE) {
      if (some(this.getValidPlacementHexes(), (h) => HexUtils.getID(h) === hid)) {
        action = 'place';
      }
    }

    if (selectedPiece) {
      const selectedHex = HexUtils.IDToHex(this.props.selectedTile);
      const speed = movesLeft(selectedPiece);

      const movementHexes = this.getValidMovementHexes(selectedHex, speed, selectedPiece).map(HexUtils.getID);
      const attackHexes = this.getValidAttackHexes(selectedHex, speed, selectedPiece).map(HexUtils.getID);

      if (movementHexes.includes(hid)) {
        action = 'move';
      } else if (attackHexes.includes(hid) && allowedToAttack(this.dummyGameState, selectedPiece, hid)) {
        action = 'attack';

        if (!getAdjacentHexes(hex).map(HexUtils.getID).includes(HexUtils.getID(selectedHex))) {
          // Attack destination is not adjacent to current position, so we need an intermediate move action.
          const possibleMoveHexes = intersectionBy(
            getAdjacentHexes(hex),
            this.getValidMovementHexes(selectedHex, speed - 1, selectedPiece),
            HexUtils.getID
          );

          // Since getValidAttackHexes().includes(hex), we're guaranteed that there's at least one valid intermediate hex.
          intermediateMoveHex = HexUtils.getID(possibleMoveHexes[0]);
        }
      }
    }

    this.props.onSelectTile(hid, action, intermediateMoveHex);
  }

  onHexHover(hex, event) {
    this.props.onHoverTile(HexUtils.getID(hex), event.type);
  }

  render() {
    // Many util functions require a game state object, so we create a dummy one with minimal data.
    // TODO find a less gross approach?
    this.dummyGameState = {
      players: {
        blue: {name: 'blue', robotsOnBoard: this.props.bluePieces},
        orange: {name: 'orange', robotsOnBoard: this.props.orangePieces}
      }
    };

    const { grid, config } = this.state;
    const hexColors = this.updateHexColors();

    const actions = {
      onClick: (h, e) => this.onHexClick(h, e),
      onHexHover: (h, e) => this.onHexHover(h, e)
    };

    const pieces = this.allPieces();
    const pieceImgs = mapValues(pieces, piece =>
      piece.card.img ? {img: piece.card.img} : {sprite: piece.card.spriteID || piece.card.name}
    );
    const pieceStats = mapValues(pieces, piece => ({
      health: getAttribute(piece, 'health'),
      attack: getAttribute(piece, 'attack')
    }));

    return (
      <div id="hexgrid">
        <HexGrid
          hexColors={hexColors}
          pieceImgs={pieceImgs}
          pieceStats={pieceStats}
          actions={actions}
          width={config.width}
          height={config.height}
          hexagons={grid.hexagons}
          layout={grid.layout}
          selectedHexId={this.props.selectedTile} />
      </div>
    );
  }
}
