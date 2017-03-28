import React from 'react';
import Paper from 'material-ui/lib/paper';

const EnergyCount = ({color, playerName, energy, isCurrentPlayer}) => (
  <div>
    <div style={{
      margin: '0 -5px 3px -15px',
      color: {orange: '#ffb85d', blue: '#badbff'}[color],
      fontWeight: 'bold',
      textAlign: 'center'
    }}>
      {playerName}
    </div>
    <Paper
      zDepth={2}
      circle
      style={{
        backgroundColor: isCurrentPlayer ? '#00bcd4' : '#ccc',
        width: 50,
        height: 50,
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        userSelect: 'none',
        cursor: 'pointer',
        minWidth: 50,
        marginRight: 8
    }}>
      <div
        style={{
          alignSelf: 'center',
          color: 'white',
          fontFamily: 'Carter One'
        }}>
        {energy.available} / {energy.total}
      </div>
    </Paper>
  </div>
);

const { bool, object, string } = React.PropTypes;

EnergyCount.propTypes = {
  color: string,
  playerName: string,
  energy: object,
  isCurrentPlayer: bool
};

export default EnergyCount;
