import React, { Component } from 'react';
import HexGrid from '../react-hexgrid/HexGrid';

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
      selectedHexes: []
    };
  }

  onHexClick(hex, event) {
    this.setState({
      grid: this.state.grid,
      config: this.state.config,
      selectedHexes: [...this.state.selectedHexes, hex]
    });
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
          selectedHexes={this.state.selectedHexes}
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
