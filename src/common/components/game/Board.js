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

    Object.keys(this.props.yourPieces).forEach((yourPieceHex) => {
      let yourPiece = this.props.yourPieces[yourPieceHex]

      if (this.props.yourTurn && yourPiece.hasMoved) {
        hexColors[yourPieceHex] = 'yellow';
      } else {
        hexColors[yourPieceHex] = 'green';
      }
    });

    Object.keys(this.props.opponentsPieces).forEach((opponentsPieceHex) => {
      hexColors[opponentsPieceHex] = 'red';
    });

    if (this.props.selectedTile) {
      let yourPiece = this.props.yourPieces[this.props.selectedTile];

      if (yourPiece) {
        hexColors = this.colorMovementHexes(HexUtils.IDToHex(this.props.selectedTile), 
          hexColors, 1);
      }
    }

    return hexColors
  }

  setHexColor(hex, color) {
    let existingHexes = this.state.hexColors;
    let newHexes = Object.assign({}, existingHexes);

    newHexes[HexUtils.getID(hex)] = color;

    return newHexes;
  }

  colorMovementHexes(hex, hexColors, tilesOut) {
    let existingHexes = hexColors;
    let newHexes = Object.assign({}, existingHexes);

    for (let i = 1; i <= tilesOut; i++) {
      newHexes[HexUtils.coordsToID(hex.q, hex.r - i, hex.s + i)] = 
        this.getMovementHexColor(HexUtils.coordsToID(hex.q, hex.r - i, hex.s + i));
      newHexes[HexUtils.coordsToID(hex.q, hex.r + i, hex.s - i)] = 
        this.getMovementHexColor(HexUtils.coordsToID(hex.q, hex.r + i, hex.s - i));
      newHexes[HexUtils.coordsToID(hex.q - i, hex.r + i, hex.s)] = 
        this.getMovementHexColor(HexUtils.coordsToID(hex.q - i, hex.r + i, hex.s));
      newHexes[HexUtils.coordsToID(hex.q + i, hex.r - i, hex.s)] = 
        this.getMovementHexColor(HexUtils.coordsToID(hex.q + i, hex.r - i, hex.s));
      newHexes[HexUtils.coordsToID(hex.q - i, hex.r, hex.s + i)] = 
        this.getMovementHexColor(HexUtils.coordsToID(hex.q - i, hex.r, hex.s + i));
      newHexes[HexUtils.coordsToID(hex.q + i, hex.r, hex.s - i)] = 
        this.getMovementHexColor(HexUtils.coordsToID(hex.q + i, hex.r, hex.s - i));
    }

    return newHexes;
  }

  getMovementHexColor(hexId) {
    if (this.props.yourPieces[hexId]) {
      return 'green';
    } else if (this.props.opponentsPieces[hexId]) {
      return 'dark_red';
    } else {
      return 'blue';
    }
  }

  onHexClick(hex, event) {
    this.props.onSelectTile(HexUtils.getID(hex));
  }

  render() {
    let { grid, config } = this.state;
    let hexColors = this.updateHexColors();

    const actions = {
      onClick: (h, e) => this.onHexClick(h, e),
      onMouseEnter: (h, e) => {},
      onMouseLeave: (h, e) => {}
    };

    return (
      <div>
        <HexGrid
          hexColors={hexColors}
          yourPieces={this.props.yourPieces}
          opponentsPieces={this.props.opponentsPieces}
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
  yourPieces: React.PropTypes.object,
  opponentsPieces: React.PropTypes.object,
  yourTurn: React.PropTypes.bool,
  onSelectTile: React.PropTypes.func,
  selectedTile: React.PropTypes.string
}

export default Board;
