import React, { Component } from 'react';
import { intersectionBy, mapValues, some } from 'lodash';

import HexGrid from '../react-hexgrid/HexGrid';
import HexUtils from '../react-hexgrid/HexUtils';
import { TYPE_ROBOT, TYPE_STRUCTURE } from '../../constants';
import {
  getAttribute, hasEffect,
  getAdjacentHexes, validPlacementHexes, validMovementHexes, validAttackHexes
} from '../../util';

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

  dummyState() {
    // util.valid[Placement/Movement/Attack]Hexes() functions require a state object, so we create a dummy one.
    // TODO find a less gross approach?
    return {
      players: {blue: {robotsOnBoard: this.props.bluePieces}, orange: {robotsOnBoard: this.props.orangePieces}}
    };
  }

  getValidPlacementHexes() {
    return validPlacementHexes(this.dummyState(), this.props.currentTurn, this.props.playingCardType);
  }

  getValidMovementHexes(startHex, speed) {
    return validMovementHexes(this.dummyState(), startHex, speed);
  }

  getValidAttackHexes(startHex, speed) {
    return validAttackHexes(this.dummyState(), startHex, speed);
  }

  updateHexColors() {
    let hexColors = {};

    Object.keys(this.props.bluePieces).forEach((hex) => {
      if (this.props.currentTurn == 'blue' && this.props.bluePieces[hex].movesLeft > 0) {
        hexColors[hex] = 'bright_blue';
      } else {
        hexColors[hex] = 'blue';
      }
    });

    Object.keys(this.props.orangePieces).forEach((hex) => {
      if (this.props.currentTurn == 'orange' && this.props.orangePieces[hex].movesLeft > 0) {
        hexColors[hex] = 'bright_orange';
      } else {
        hexColors[hex] = 'orange';
      }
    });

    if (this.props.target.choosing) {
      this.props.target.possibleHexes.forEach((hex) => {
        hexColors[hex]  = 'green';
      });
    } else if (this.props.selectedTile) {
      const selectedPiece = this.currentPlayerPieces()[this.props.selectedTile];

      if (selectedPiece && selectedPiece.movesLeft > 0) {
        const hex = HexUtils.IDToHex(this.props.selectedTile);
        hexColors = this.colorMovementHexes(hex, hexColors, selectedPiece.movesLeft);
      }
    } else if (this.props.playingCardType == TYPE_ROBOT || this.props.playingCardType == TYPE_STRUCTURE) {
      this.getValidPlacementHexes().forEach((hex) => {
        hexColors[HexUtils.getID(hex)] = 'green';
      });
    }

    return hexColors;
  }

  colorMovementHexes(hex, hexColors, speed) {
    const selectedPiece = this.currentPlayerPieces()[this.props.selectedTile];
    const existingHexColors = hexColors;

    let newHexColors = Object.assign({}, existingHexColors);

    this.getValidMovementHexes(hex, speed).forEach((hex) =>
      newHexColors[HexUtils.getID(hex)] = 'green'
    );

    if (!hasEffect(selectedPiece, 'cannotattack')) {
      this.getValidAttackHexes(hex, speed).forEach((hex) =>
        newHexColors[HexUtils.getID(hex)] = 'red'
      );
    }

    return newHexColors;
  }

  onHexClick(hex, event) {
    let action = '';
    let intermediateMoveHex = null;

    const selectedPiece = this.currentPlayerPieces()[this.props.selectedTile];

    if (this.props.playingCardType == TYPE_ROBOT || this.props.playingCardType == TYPE_STRUCTURE) {
      if (some(this.getValidPlacementHexes(), (h) => HexUtils.getID(h) === HexUtils.getID(hex))) {
        action = 'place';
      }
    }

    if (selectedPiece) {
      const selectedHex = HexUtils.IDToHex(this.props.selectedTile);
      const speed = selectedPiece.stats.speed;

      const validMovementHexes = this.getValidMovementHexes(selectedHex, speed).map(HexUtils.getID);
      const validAttackHexes = this.getValidAttackHexes(selectedHex, speed).map(HexUtils.getID);

      if (validMovementHexes.includes(HexUtils.getID(hex))) {
        action = 'move';
      } else if (validAttackHexes.includes(HexUtils.getID(hex)) && !hasEffect(selectedPiece, 'cannotattack')) {
        action = 'attack';

        if (!getAdjacentHexes(hex).map(HexUtils.getID).includes(HexUtils.getID(selectedHex))) {
          // Attack destination is not adjacent to current position, so we need an intermediate move action.
          const possibleMoveHexes = intersectionBy(
            getAdjacentHexes(hex),
            this.getValidMovementSpaces(selectedHex, speed - 1),
            HexUtils.getID
          );

          if (possibleMoveHexes.length > 0) {
            intermediateMoveHex = HexUtils.getID(possibleMoveHexes[0]);
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
    const pieceNames = mapValues(pieces, piece => piece.card.name);
    const pieceImgs = mapValues(pieces, piece => piece.card.img);
    const pieceStats = mapValues(pieces, (piece) => {
      return { health: getAttribute(piece, 'health'), attack: getAttribute(piece, 'attack') };
    });

    return (
      <div>
        <HexGrid
          hexColors={hexColors}
          pieceNames={pieceNames}
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
