import React, { Component } from 'react';
import Paper from 'material-ui/lib/paper';

class EnergyCount extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Paper
        zDepth={2}
        circle
        style={{
          backgroundColor: this.props.isCurrentPlayer ? '#00bcd4' : '#ccc',
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
          {this.props.energy.available} / {this.props.energy.total}
        </div>
      </Paper>
    );
  }
}

const { bool, object } = React.PropTypes;

EnergyCount.propTypes = {
  energy: object,
  isCurrentPlayer: bool
};

export default EnergyCount;
