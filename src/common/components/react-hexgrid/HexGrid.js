import React, { Component } from 'react';
import { number, string, object, array } from 'prop-types';

import HexUtils from './HexUtils';
import HexShape from './HexShape';
import Path from './Path';
import Layout from './Layout';
import GridGenerator from './GridGenerator';
import loadImages from './HexGridImages';

export default class HexGrid extends Component {
  static propTypes = {
    width: number.isRequired,
    height: number.isRequired,
    actions: object.isRequired,
    layout: object.isRequired,
    hexagons: array.isRequired,
    path: object,
    hexColors: object,
    pieceImgs: object,
    pieceStats: object,
    selectedHexId: string
  };

  static defaultProps = {
    width: 800,
    height: 600,
    path: { start: null, end: null }
  };

  static generate(config, content) {
    const layout = new Layout(config.layout, config.origin);
    const generator = GridGenerator.getGenerator(config.map);
    const hexagons = generator.apply(this, config.mapProps);

    return { hexagons, layout };
  }

  renderHexes() {
    return this.props.hexagons.map((hex, index) => (
      <HexShape
        key={index}
        hex={hex}
        layout={this.props.layout}
        actions={this.props.actions}
        fill={this.props.hexColors[HexUtils.getID(hex)]}
        pieceImg={this.props.pieceImgs[HexUtils.getID(hex)] || {}}
        pieceStats={this.props.pieceStats[HexUtils.getID(hex)]}
        images={loadImages()} />
    ));
  }

  renderSelectedHex() {
    const selectedHex = this.props.hexagons.find(hex => HexUtils.getID(hex) === this.props.selectedHexId);
    if (selectedHex) {
      return (
        <HexShape
          selected
          hex={selectedHex}
          layout={this.props.layout}
          actions={this.props.actions} />
      );
    }
  }

  render() {
    return (
      <svg className="grid" width={this.props.width} height={this.props.height} viewBox="-50 -50 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
        {this.renderHexes()}
        {this.renderSelectedHex()}
        <Path {...this.props.path} layout={this.props.layout} />
      </svg>
    );
  }
}
