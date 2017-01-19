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
          width: 48,
          height: 48,
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          userSelect: 'none',
          cursor: 'pointer'
      }}>
        <div
          style={{
            alignSelf: 'center',
            color: 'white',
            fontFamily: 'Luckiest Guy'
          }}>
          {this.props.energy.total - this.props.energy.used} / {this.props.energy.total}
        </div>
      </Paper>
    );
  }
}

EnergyCount.propTypes = {
  energy: React.PropTypes.object
}

export default EnergyCount;
