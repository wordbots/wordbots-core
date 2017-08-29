import React, {Component} from 'react';
import {bool, object, string} from 'prop-types';
import Paper from 'material-ui/Paper';
import {times} from 'lodash';

import {id} from '../../util/common';

class EnergyCount extends Component {
  static propTypes = {
    color: string,
    energy: object,
    isCurrentPlayer: bool
  };

  renderEnergyTile (color, filled) {
    return (
      <Paper
        key={id()}
        style={{
          height: 64,
          width: 18,
          backgroundColor: filled ? {orange: '#ffb85d', blue: '#badbff'}[color] : 'transparent',
          marginLeft: 8,
          border: '3px solid white',
          borderRadius: 4
        }}
      />
    );
  }

  renderEnergyTiles () {
    const {color, energy} = this.props;
    const emptyEnergy = energy.total - energy.available;
    const energyTiles = [];

    times(energy.available, () => {
      energyTiles.push(this.renderEnergyTile(color, true));
    });

    times(emptyEnergy, () => {
      energyTiles.push(this.renderEnergyTile(color, false));
    });

    if (energy.total === 0) {
      energyTiles.push(this.renderEnergyTile(color, false));
    }

    return energyTiles;
  }

  render () {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#111',
          border: '2px solid #AAA',
          padding: 10,
          borderRadius: 5,
          boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
          color: 'white',
          fontFamily: 'VT323'
        }}
      >
        <span
          style={{
            fontSize: 72,
            letterSpacing: -6,
            marginRight: 6
          }}
        >
          {this.props.energy.available}
        </span>
        <div
          style={{
            fontSize: 24,
            transform: 'rotate(-90deg)',
            margin: '0 -15px'
          }}
        >
          ENERGY
        </div>
        {this.renderEnergyTiles()}
      </div>
    );
  }
}

export default EnergyCount;
