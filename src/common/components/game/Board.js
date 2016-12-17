import React, { Component } from 'react';
import HexGrid from '../react-hexgrid/HexGrid';
import Hex from '../react-hexgrid/Hex';

class Board extends Component {
  constructor(props) {
    super(props);

    let boardConfig = {
      width: 800, height: 800,
      layout: { width: 6, height: 6, flat: true, spacing: 0 },
      origin: { x: 0, y: 0 },
      map: 'hexagon',
      mapProps: [ 4 ]
    }
    let grid = HexGrid.generate(boardConfig);

    this.state = {
      grid, 
      config: boardConfig,
      blueHexes: [],
      redHexes: []
    };
  }

  setHexColor(hex, color) {
    let newHexes = [];
    let existingHexes = [];

    if (color === 'red') {
      existingHexes = this.state.redHexes;
    } else if (color === 'blue') {
      existingHexes = this.state.blueHexes;
    }

    newHexes = [...existingHexes, hex];

    this.setState({
      grid: this.state.grid,
      config: this.state.config,
      blueHexes: color === 'blue' ? newHexes : this.state.blueHexes,
      redHexes: color === 'red' ? newHexes : this.state.redHexes
    });
  }

  colorSurroundingHexes(hex, color, tilesOut) {
    let newHexes = [];
    let existingHexes = [];

    if (color === 'red') {
      existingHexes = this.state.redHexes;
    } else if (color === 'blue') {
      existingHexes = this.state.blueHexes;
    }

    for (let i = 0; i <= tilesOut; i++) {      
      newHexes.push(new Hex(hex.q, hex.r - i, hex.s + i));
      newHexes.push(new Hex(hex.q, hex.r + i, hex.s - i));
      newHexes.push(new Hex(hex.q - i, hex.r + i, hex.s));
      newHexes.push(new Hex(hex.q + i, hex.r - i, hex.s));
      newHexes.push(new Hex(hex.q - i, hex.r, hex.s + i));
      newHexes.push(new Hex(hex.q + i, hex.r, hex.s - i));
    }

    newHexes = newHexes.concat(existingHexes);

    console.log(newHexes);

    this.setState({
      grid: this.state.grid,
      config: this.state.config,
      blueHexes: color === 'blue' ? newHexes : this.state.blueHexes,
      redHexes: color === 'red' ? newHexes : this.state.redHexes
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
          blueHexes={this.state.blueHexes}
          redHexes={this.state.redHexes}
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
