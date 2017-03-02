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
          backgroundColor: '#00bcd4',
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

EnergyCount.propTypes = {
  energy: React.PropTypes.object
};

export default EnergyCount;
