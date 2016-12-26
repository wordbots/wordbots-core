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

    this.state = {
      grid, 
      config: boardConfig,
      hexColors: hexColors,
    };
  }

  setHexColor(hex, color) {
    let existingHexes = this.state.hexColors;
    let newHexes = Object.assign({}, existingHexes);

    newHexes[HexUtils.getID(hex)] = color;

    this.setState({
      grid: this.state.grid,
      config: this.state.config,
      hexColors: newHexes
    });
  }

  colorSurroundingHexes(hex, color, tilesOut) {
    let existingHexes = this.state.hexColors;
    let newHexes = Object.assign({}, existingHexes);

    for (let i = 1; i <= tilesOut; i++) {      
      newHexes[HexUtils.getID(new Hex(hex.q, hex.r - i, hex.s + i))] = color;
      newHexes[HexUtils.getID(new Hex(hex.q, hex.r + i, hex.s - i))] = color;
      newHexes[HexUtils.getID(new Hex(hex.q - i, hex.r + i, hex.s))] = color;
      newHexes[HexUtils.getID(new Hex(hex.q + i, hex.r - i, hex.s))] = color;
      newHexes[HexUtils.getID(new Hex(hex.q - i, hex.r, hex.s + i))] = color;
      newHexes[HexUtils.getID(new Hex(hex.q + i, hex.r, hex.s - i))] = color;
    }

    console.log(newHexes);

    this.setState({
      grid: this.state.grid,
      config: this.state.config,
      hexColors: newHexes
    })
  }

  onHexClick(hex, event) {
    this.colorSurroundingHexes(hex, 'blue', 1);
  }

  render() {
    let { grid, config } = this.state;

    const actions = {
      onClick: (h, e) => this.onHexClick(h, e),
      onMouseEnter: (h, e) => {},
      onMouseLeave: (h, e) => {}
    };

    return (
      <div>
        <HexGrid
          hexColors={this.state.hexColors}
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
  yourTurn: React.PropTypes.bool
}

export default Board;
