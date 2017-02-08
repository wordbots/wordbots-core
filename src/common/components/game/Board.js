import React, { Component } from 'react';
import { flatMap, mapValues } from 'lodash';

import GridGenerator from '../react-hexgrid/GridGenerator';
import HexGrid from '../react-hexgrid/HexGrid';
import Hex from '../react-hexgrid/Hex';
import HexUtils from '../react-hexgrid/HexUtils';
import { TYPE_ROBOT, TYPE_STRUCTURE } from '../../constants';
import { getAttribute, hasEffect } from '../../util';

class Board extends Component {
  constructor(props) {
    super(props);

    let boardConfig = {
      width: 600, height: 600,
      layout: { width: 6, height: 6, flat: false, spacing: 0 },
      origin: { x: 0, y: 0 },
      map: 'hexagon',
      mapProps: [ 4 ]
    };
    let grid = HexGrid.generate(boardConfig);

    this.state = {
      grid,
      config: boardConfig
    };
  }

  currentPlayerPieces() {
    return (this.props.currentTurn == 'blue' ? this.props.bluePieces : this.props.orangePieces);
  }

  opponentPieces() {
    return (this.props.currentTurn == 'blue' ? this.props.orangePieces : this.props.bluePieces);
  }

  allPieces() {
    return Object.assign({}, this.props.bluePieces, this.props.orangePieces);
  }

  getAdjacentHexes(hex) {
    return [
      new Hex(hex.q, hex.r - 1, hex.s + 1),
      new Hex(hex.q, hex.r + 1, hex.s - 1),
      new Hex(hex.q - 1, hex.r + 1, hex.s),
      new Hex(hex.q + 1, hex.r - 1, hex.s),
      new Hex(hex.q - 1, hex.r, hex.s + 1),
      new Hex(hex.q + 1, hex.r, hex.s - 1)
    ].filter(hex => GridGenerator.hexagon(4).map(HexUtils.getID).includes(HexUtils.getID(hex)));
  }

  getRobotPlacementTiles() {
    if (this.props.currentTurn === 'blue') {
      return [
        new Hex(-3, -1, 4),
        new Hex(-3, 0, 3),
        new Hex(-4, 1, 3)
      ];
    } else {
      return [
        new Hex(4, -1, -3),
        new Hex(3, 0, -3),
        new Hex(3, 1, -4)
      ];
    }
  }

  getStructurePlacementTiles() {
    const currentHexes = Object.keys(this.currentPlayerPieces()).map(HexUtils.IDToHex);
    return flatMap(currentHexes, this.getAdjacentHexes);
  }

  updateHexColors() {
    let hexColors = {};

    if (this.props.playingCardType == TYPE_ROBOT || this.props.playingCardType == TYPE_STRUCTURE) {
      const placementTiles = (this.props.playingCardType == TYPE_ROBOT) ? this.getRobotPlacementTiles() : this.getStructurePlacementTiles();
      placementTiles.forEach((hex) => {
        if (this.props.currentTurn == 'blue') {
          if (this.props.bluePieces[hex]) {
            hexColors[HexUtils.getID(hex)]  = 'blue';
          } else if (this.props.orangePieces[hex]) {
            hexColors[HexUtils.getID(hex)]  = 'red';
          } else {
            hexColors[HexUtils.getID(hex)]  = 'green';
          }
        } else {
          if (this.props.bluePieces[hex]) {
            hexColors[HexUtils.getID(hex)]  = 'red';
          } else if (this.props.orangePieces[hex]) {
            hexColors[HexUtils.getID(hex)]  = 'orange';
          } else {
            hexColors[HexUtils.getID(hex)]  = 'green';
          }
        }
      });
    }

    Object.keys(this.props.bluePieces).forEach((hex) => {
      if (this.props.currentTurn == 'blue' && this.props.bluePieces[hex].hasMoved) {
        hexColors[hex] = 'blue';
      } else {
        hexColors[hex] = 'bright_blue';
      }
    });

    Object.keys(this.props.orangePieces).forEach((hex) => {
      if (this.props.currentTurn == 'orange' && this.props.orangePieces[hex].hasMoved) {
        hexColors[hex] = 'orange';
      } else {
        hexColors[hex] = 'bright_orange';
      }
    });

    if (this.props.selectedTile) {
      const selectedPiece = this.currentPlayerPieces()[this.props.selectedTile];

      if (selectedPiece && !selectedPiece.hasMoved) {
        const hex = HexUtils.IDToHex(this.props.selectedTile);
        hexColors = this.colorMovementHexes(hex, hexColors, selectedPiece.stats.speed);
      }
    } else if (this.props.target.choosing) {
      this.props.target.possibleHexes.forEach((hex) => {
        hexColors[hex]  = 'green';
      });
    }

    return hexColors;
  }

  colorMovementHexes(hex, hexColors, speed) {
    const selectedPiece = this.currentPlayerPieces()[this.props.selectedTile];
    const existingHexColors = hexColors;

    let newHexColors = Object.assign({}, existingHexColors);

    this.getValidMovementSpaces(hex, speed).forEach((hex) =>
      newHexColors[HexUtils.getID(hex)] = 'green'
    );

    if (!hasEffect(selectedPiece, 'cannotattack')) {
      this.getValidAttackSpaces(hex, speed).forEach((hex) =>
        newHexColors[HexUtils.getID(hex)] = 'red'
      );
    }

    return newHexColors;
  }

  getValidMovementSpaces(startHex, speed) {
    let validHexes = [startHex];

    for (let distance = 0; distance < speed; distance++) {
      let newHexes = [].concat.apply([], validHexes.map((hex) =>
        this.getAdjacentHexes(hex)
          .filter((hex) => !Object.keys(this.allPieces()).includes(HexUtils.getID(hex)))
      ));

      validHexes = validHexes.concat(newHexes);
    }

    return validHexes.filter((hex) => hex != startHex);
  }

  getValidAttackSpaces(startHex, speed) {
    let validMoveHexes = [startHex].concat(this.getValidMovementSpaces(startHex, speed - 1));

    let potentialAttackHexes = [].concat.apply([], validMoveHexes.map((hex) =>
      this.getAdjacentHexes(hex)
    ));

    return potentialAttackHexes.filter((hex) =>
      Object.keys(this.opponentPieces()).includes(HexUtils.getID(hex))
    );
  }

  onHexClick(hex, event) {
    let action = '';
    let intermediateMoveHex = null;

    const selectedPiece = this.currentPlayerPieces()[this.props.selectedTile];

    if (this.props.playingCardType == TYPE_ROBOT || this.props.playingCardType == TYPE_STRUCTURE) {
      const placementTiles = (this.props.playingCardType == TYPE_ROBOT) ? this.getRobotPlacementTiles() : this.getStructurePlacementTiles();
      placementTiles.forEach((placementHex) => {
        if (HexUtils.getID(hex) === HexUtils.getID(placementHex) &&
            !this.props.orangePieces[HexUtils.getID(hex)] &&
            !this.props.bluePieces[HexUtils.getID(hex)]) {
          action = 'place';
        }
      });
    }

    if (selectedPiece) {
      const selectedHex = HexUtils.IDToHex(this.props.selectedTile);
      const speed = selectedPiece.stats.speed;

      const validMovementHexes = this.getValidMovementSpaces(selectedHex, speed).map(HexUtils.getID);
      const validAttackHexes = this.getValidAttackSpaces(selectedHex, speed).map(HexUtils.getID);

      if (validMovementHexes.includes(HexUtils.getID(hex))) {
        action = 'move';
      } else if (validAttackHexes.includes(HexUtils.getID(hex)) && !hasEffect(selectedPiece, 'cannotattack')) {
        action = 'attack';

        if (!this.getAdjacentHexes(hex).map(HexUtils.getID).includes(HexUtils.getID(selectedHex))) {
          // Attack destination is not adjacent to current position, so we need an intermediate move action.
          const possibleMoveHexes = this.getAdjacentHexes(hex).map(HexUtils.getID).filter((h) => validMovementHexes.includes(h));

          if (possibleMoveHexes.length > 0) {
            intermediateMoveHex = possibleMoveHexes[0];
          } else {
            action = ''; // Attack is not possible!
          }
        }
      }
    }

    this.props.onSelectTile(HexUtils.getID(hex), action, intermediateMoveHex);
  }

  onHexHover(hex, event) {
    this.props.onHoverTile(HexUtils.getID(hex), event.type);
  }

  render() {
    let { grid, config } = this.state;
    let hexColors = this.updateHexColors();

    const actions = {
      onClick: (h, e) => this.onHexClick(h, e),
      onMouseEnter: (h, e) => this.onHexHover(h, e),
      onMouseLeave: (h, e) => this.onHexHover(h, e)
    };

    const pieces = Object.assign({}, this.currentPlayerPieces(), this.opponentPieces());
    const pieceImgs = mapValues(pieces, piece => piece.card.img);
    const pieceStats = mapValues(pieces, function (piece) {
      return { health: getAttribute(piece, 'health'), attack: getAttribute(piece, 'attack') };
    });

    return (
      <div>
        <HexGrid
          hexColors={hexColors}
          pieceImgs={pieceImgs}
          pieceStats={pieceStats}
          actions={actions}
          width={config.width}
          height={config.height}
          hexagons={grid.hexagons}
          layout={grid.layout} />
      </div>
    );
  }
}

Board.propTypes = {
  bluePieces: React.PropTypes.object,
  orangePieces: React.PropTypes.object,

  currentTurn: React.PropTypes.string,
  selectedTile: React.PropTypes.string,
  playingCardType: React.PropTypes.number,
  target: React.PropTypes.object,

  onSelectTile: React.PropTypes.func,
  onHoverTile: React.PropTypes.func
};

export default Board;
