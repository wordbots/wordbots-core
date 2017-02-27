import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

import Card from '../components/game/Card';

function mapStateToProps(state) {
  return {
    cards: state.collection.cards
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

class CardCreator extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{paddingLeft: 256, /*paddingRight: 256,*/ paddingTop: 64, height: '100%'}}>
        <Helmet title="Cards"/>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
          maxWidth: '90%',
          margin: '50px auto'
        }}>
          {
            this.props.cards.map(card =>
              <Card
                visible
                name={card.name}
                spriteID={card.spriteID}
                type={card.type}
                text={card.text || ''}
                stats={card.stats}
                cardStats={card.stats}
                cost={card.cost}
                baseCost={card.cost}
                scale={1}
                />
            )
          }
        </div>
      </div>
    );
  }
}

CardCreator.propTypes = {
  cards: React.PropTypes.array
};

export default connect(mapStateToProps, mapDispatchToProps)(CardCreator);
