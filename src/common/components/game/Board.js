import React, { Component } from 'react';
import HexGrid from '../react-hexgrid/HexGrid';
import Hex from '../react-hexgrid/Hex';
import HexUtils from '../react-hexgrid/HexUtils';

class Board extends Component {
  constructor(props) {
    super(props);

    let boardConfig = {
      width: 600, height: 600,
      layout: { width: 6, height: 6, flat: false, spacing: 0 },
      origin: { x: 0, y: 0 },
      map: 'hexagon',
      mapProps: [ 4 ]
    }
    let grid = HexGrid.generate(boardConfig);

    this.state = {
      grid,
      config: boardConfig
    };
  }

  updateHexColors() {
    let hexColors = {};

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
      let pieces = this.props.currentTurn == 'blue' ? this.props.bluePieces : this.props.orangePieces;
      let selectedPiece = pieces[this.props.selectedTile];

      if (selectedPiece) {
        hexColors = this.colorMovementHexes(HexUtils.IDToHex(this.props.selectedTile), hexColors, 1);
      }
    }

    return hexColors
  }

  setHexColor(hex, color) {
    const existingHexes = this.state.hexColors;
    let newHexes = Object.assign({}, existingHexes);

    newHexes[HexUtils.getID(hex)] = color;

    return newHexes;
  }

  colorMovementHexes(hex, hexColors, tilesOut) {
    const existingHexes = hexColors;
    let newHexes = Object.assign({}, existingHexes);

    // TODO: Incorporate tilesOut.
    this.getValidMovementSpaces().forEach((hex) =>
      newHexes[hex] = this.getMovementHexColor(hex)
    );

    return newHexes;
  }

  getValidMovementSpaces() {
    if (!this.props.selectedTile) {
      return [];
    } else {
      let hex = HexUtils.IDToHex(this.props.selectedTile);

      return [
        HexUtils.coordsToID(hex.q, hex.r - 1, hex.s + 1),
        HexUtils.coordsToID(hex.q, hex.r + 1, hex.s - 1),
        HexUtils.coordsToID(hex.q - 1, hex.r + 1, hex.s),
        HexUtils.coordsToID(hex.q + 1, hex.r - 1, hex.s),
        HexUtils.coordsToID(hex.q - 1, hex.r, hex.s + 1),
        HexUtils.coordsToID(hex.q + 1, hex.r, hex.s - 1)
      ];
    }
  }

  getMovementHexColor(hexId) {
    const yourPieces = this.props.currentTurn == 'blue' ? this.props.bluePieces : this.props.orangePieces;
    const opponentsPieces = this.props.currentTurn == 'blue' ? this.props.orangePieces : this.props.bluePieces;

    if (yourPieces[hexId]) {
      return 'bright_' + this.props.currentTurn;
    } else if (opponentsPieces[hexId]) {
      return 'red';
    } else {
      return 'green';
    }
  }

  onHexClick(hex, event) {
    const isMovementAction = this.getValidMovementSpaces().includes(HexUtils.getID(hex));
    this.props.onSelectTile(HexUtils.getID(hex), isMovementAction);
  }

  render() {
    let { grid, config } = this.state;
    let hexColors = this.updateHexColors();

    const yourPieces = this.props.currentTurn == 'blue' ? this.props.bluePieces : this.props.orangePieces;
    const opponentsPieces = this.props.currentTurn == 'blue' ? this.props.orangePieces : this.props.bluePieces;

    const actions = {
      onClick: (h, e) => this.onHexClick(h, e),
      onMouseEnter: (h, e) => {},
      onMouseLeave: (h, e) => {}
    };

    return (
      <div>
        <HexGrid
          hexColors={hexColors}
          yourPieces={yourPieces}
          opponentsPieces={opponentsPieces}
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
  onSelectTile: React.PropTypes.func,
  selectedTile: React.PropTypes.string
}

export default Board;
