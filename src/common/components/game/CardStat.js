import React, { Component } from 'react';
import Paper from 'material-ui/lib/paper';
import ReactTooltip from 'react-tooltip';

class CardStat extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let backgroundColor = '';

    switch (this.props.type) {
      case 'attack':
        backgroundColor = '#E57373';
        break;
      case 'speed':
        backgroundColor = '#03A9F4';
        break;
      case 'health':
        backgroundColor = '#81C784';
        break;
    }

    return (
      <div>
        <Paper circle 
          zDepth={1}
          data-for="stat-tooltip"
          data-tip={this.props.type.toProperCase()}
          style={{
            width: 32,
            height: 32,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: backgroundColor,
            color: '#fff',
            fontFamily: 'Luckiest Guy',
            fontSize: 16
        }}>
          <ReactTooltip 
            id="stat-tooltip" 
            place="top" 
            type="dark" 
            effect="float" />
          <div>{this.props.value}</div>
        </Paper>
      </div>
    )
  }
}

CardStat.propTypes = {
  type: React.PropTypes.string,
  value: React.PropTypes.number
}

String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function (txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

export default CardStat;
