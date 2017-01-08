import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';

import CardBack from './CardBack';

class Deck extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.deck.length > 0) {     
      return (
        <div style={{fontFamily: 'Luckiest Guy'}}>
          <div data-tip={this.props.deck.length + ' Cards'} data-for="deck-tooltip">
            <CardBack />
          </div>
          <ReactTooltip 
            id="deck-tooltip" 
            place="top" 
            type="dark" 
            effect="float" />
        </div>
      );
    } else {
      return (
        <div style={{
          width: 140,
          height: 200,
          borderRadius: 5,
          border: '2px dashed #DDD',
          display: 'flex',
          alignItems: 'center',
          userSelect: 'none'
        }}>
          <div style={{
            margin: 'auto',
            fontFamily: 'Luckiest Guy',
            fontSize: 32,
            textAlign: 'center',
            color: '#CCC'
          }}>NO CARDS LEFT</div>
        </div>
      )
    }
  }
}

Deck.propTypes = {
  deck: React.PropTypes.array
}

export default Deck;
