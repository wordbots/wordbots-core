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
        <div>
          <div data-tip data-for="your-deck-tooltip">
            <CardBack />
          </div>
          <ReactTooltip 
            id="your-deck-tooltip" 
            place="top" 
            type="dark" 
            effect="float" 
            getContent={() => this.props.deck.length} />
        </div>
      );
    } else {
      return (
        <div style={{
          width: 140,
          height: 200
        }}/>
      )
    }
  }
}

Deck.propTypes = {
  deck: React.PropTypes.array
}

export default Deck;
