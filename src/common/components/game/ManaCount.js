import React, { Component } from 'react';
import Paper from 'material-ui/lib/paper';

class ManaCount extends Component {
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
          {this.props.mana.total - this.props.mana.used} / {this.props.mana.total}
        </div>
      </Paper>
    );
  }
}

ManaCount.propTypes = {
  mana: React.PropTypes.object
}

export default ManaCount;
