import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class VictoryScreen extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const colors = {
      'orange': '#ffb85d',
      'blue': '#badbff'
    };

    return (
      <div style={{
        display: this.props.winner === null ? 'none' : 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        fontFamily: 'Luckiest Guy',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        fontSize: 96,
        color: this.props.winner === null ? 'black' : colors[this.props.winner],
        borderRadius: 2
      }}>
        <ReactCSSTransitionGroup
          transitionName="card-viewer-fade"
          transitionEnterTimeout={100}
          transitionLeaveTimeout={100}>
          <div>{this.props.winner === null ? '' : this.props.winner + ' Wins!'}</div>
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

VictoryScreen.propTypes = {
  winner: React.PropTypes.string
};

export default VictoryScreen;
