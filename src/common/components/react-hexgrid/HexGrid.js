import React from 'react'
import Hex from './Hex'
import HexUtils from './HexUtils'
const { number, object, bool, string, array } = React.PropTypes
import HexShape from './HexShape'
import Path from './Path'
import Layout from './Layout'
import GridGenerator from './GridGenerator'

class HexGrid extends React.Component {
  render() {
    const { hexColors, hexPieces } = this.props;

    let images = {
      'blue_tile': require('../img/blue_tile.png'),
      'red_tile': require('../img/red_tile.png'),
      'char': require('../img/char.png'),
      'char_weapon': require('../img/char_weapon.png')
    };

    return (
      <svg className="grid" width={this.props.width} height={this.props.height} viewBox="-50 -50 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
        {
          this.props.hexagons.map((hex, index) => {
            let fill = hexColors[HexUtils.getID(hex)];
            let piece = hexPieces[HexUtils.getID(hex)];

            return (
              <HexShape 
                key={index} 
                hex={hex} 
                layout={this.props.layout} 
                actions={this.props.actions} 
                fill={fill}
                piece={piece} 
                images={images} />
            );
          })
        }
        <Path {...this.props.path} layout={this.props.layout} />
      </svg>
    );
  }
}

HexGrid.generate = (config, content) => {
  let layout = new Layout(config.layout, config.origin);
  let generator = GridGenerator.getGenerator(config.map);
  let hexagons = generator.apply(this, config.mapProps);

  return { hexagons, layout };
}

HexGrid.propTypes = {
  width: number.isRequired,
  height: number.isRequired,
  actions: object.isRequired,
  layout: object.isRequired,
  hexagons: array.isRequired,
  path: object,
  hexColors: object,
  hexPieces: object
};

HexGrid.defaultProps = {
  width: 800,
  height: 600,
  path: { start: null, end: null }
}

export default HexGrid;
