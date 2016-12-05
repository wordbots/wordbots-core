import React, { Component } from 'react';

class Card extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: false,
      cardStats: this.props.cardStats
    }
  }

  render() {
    if (this.props.opponent) {
      return (
        <div style={{
          width: 100,
          height: 150,
          marginRight: 5,
          borderRadius: 5,
          border: '2px solid #333',
          backgroundColor: '#f44336',
          boxSizing: 'border-box',
          padding: 5
        }}>
          <div style={{
            writingMode: 'vertical-lr',
            width: 'calc(100% - 4px)',
            height: 'calc(100% - 4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 5,
            border: '2px solid #FFF'
          }}>
            <div style={{
              color: '#fff',
              fontSize: 20,
              fontFamily: 'Luckiest Guy'
            }}>WordBots</div>
          </div>
        </div>
      )
    } else {
      return (
        <div style={{
          width: 100,
          height: 150,
          marginRight: 5,
          borderRadius: 5,
          border: '2px solid #333'
        }}>
          <div style={{
            textAlign: 'center',
            padding: 10
          }}>{this.state.cardStats.name}</div>
        </div>
      )
    }
  }
}

export default Card;
