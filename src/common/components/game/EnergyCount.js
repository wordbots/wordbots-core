import React, { Component } from 'react';
import { bool, object, string } from 'prop-types';
import Paper from 'material-ui/Paper';

class EnergyCount extends Component {
  static propTypes = {
    color: string,
    energy: object,
    isCurrentPlayer: bool
  }

  renderEnergyTile(color, filled) {
    return (
      <Paper style={{
        height: 64,
        width: 18,
        backgroundColor: filled ? {orange: '#ffb85d', blue: '#badbff'}[color] : 'transparent',
        marginLeft: 8,
        border: '3px solid white',
        borderRadius: 4
      }} />
    );
  }

  renderEnergyTiles() {
    const { color, energy } = this.props;
    const emptyEnergy = energy.total - energy.available;
    const energyTiles = [];

    for (let i = 0; i < energy.available; i++) {
      energyTiles.push(this.renderEnergyTile(color, true));
    }

    for (let i = 0; i < emptyEnergy; i++) {
      energyTiles.push(this.renderEnergyTile(color, false));
    }

    if (energy.total === 0) {
      energyTiles.push(this.renderEnergyTile(color, false));
    }

    return energyTiles;
  }


  render() {
    return (
      <div style={{display: 'flex'}}>
        {this.renderEnergyTiles()}
      </div> 
    );
  }
}

export default EnergyCount;
