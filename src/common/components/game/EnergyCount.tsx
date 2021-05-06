import Paper from '@material-ui/core/Paper';
import { times } from 'lodash';
import * as React from 'react';

import { BLUE_PLAYER_COLOR, ORANGE_PLAYER_COLOR } from '../../constants';
import * as w from '../../types';
import { id } from '../../util/common';

interface EnergyCountProps {
  color: w.PlayerColor
  energy: w.PlayerEnergy
}

export default class EnergyCount extends React.Component<EnergyCountProps> {
  public render(): JSX.Element {
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

  private renderEnergyTile(color: w.PlayerColor, filled: boolean): JSX.Element {
    return (
      <Paper
        key={id()}
        style={{
          height: 64,
          width: 16,
          backgroundColor: filled ? {orange: ORANGE_PLAYER_COLOR, blue: BLUE_PLAYER_COLOR}[color] : 'transparent',
          marginLeft: 6,
          border: '3px solid white',
          borderRadius: 4
        }}
      />
    );
  }

  private renderEnergyTiles(): JSX.Element[] {
    const { color, energy } = this.props;
    const emptyEnergy = energy.total - energy.available;
    const energyTiles: JSX.Element[] = new Array<JSX.Element>();

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
}
