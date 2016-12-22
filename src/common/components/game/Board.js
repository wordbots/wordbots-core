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
      config: boardConfig,
      hexColors: {},
      hexPieces: {
        '0,-4,4': 'char',
        '-1,-3,4': 'char_weapon',
        '0,-3,3': 'char_weapon',
        '1,-4,3': 'char_weapon',
        '0,4,-4': 'char_weapon'
      }
    };
  }

  setHexColor(hex, color) {
    let existingHexes = this.state.hexColors;
    let newHexes = Object.assign({}, existingHexes);

    newHexes[HexUtils.getID(hex)] = color;

    this.setState({
      grid: this.state.grid,
      config: this.state.config,
      hexColors: newHexes,
      hexPieces: this.state.hexPieces
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
      hexColors: newHexes,
      hexPieces: this.state.hexPieces
    })
  }

  onHexClick(hex, event) {
    // if (Math.floor(Math.random() * 2)) {
    //   this.setHexColor(hex, 'red');
    // } else {
    //   this.setHexColor(hex, 'blue');
    // }

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
          hexPieces={this.state.hexPieces}
          actions={actions}
          width={config.width} 
          height={config.height} 
          hexagons={grid.hexagons} 
          layout={grid.layout} />
      </div>
    );
  }
}

export default Board;
