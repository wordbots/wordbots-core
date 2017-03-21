import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Paper from 'material-ui/lib/paper';

import CardViewer from '../components/game/CardViewer';

function mapStateToProps(state) {
  return {
    decks: state.collection.decks
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

class Decks extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hoveredCard: null
    };
  }

  onHover(card) {
    this.setState({hoveredCard: {card: card, stats: card.stats}});
  }

  render() {
    return (
      <div style={{height: '100%'}}>
        <Helmet title="Decks" />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{marginTop: 50, marginLeft: 40}}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              width: '100%',
              margin: 10
            }}>
              {
                this.props.decks.map(deck =>
                  <Paper
                    key={deck.name}
                    style={{padding: 10}}
                  >
                    <h3>{deck.name}</h3>
                    {Object.values(_.groupBy(deck.cards, c => c.name))
                      .map(cards => [cards[0].name, cards[0], cards.length])
                      .sort()
                      .map(([name, card, num]) =>
                        <div
                          key={name}
                          onMouseOver={e => this.onHover(card)}
                        >
                          {name} ({num})
                        </div>
                      )}
                  </Paper>
                )
              }
            </div>
          </div>

          <div style={{
            margin: 50,
            width: 220,
            height: 300,
            position: 'relative'
          }}>
            <CardViewer hoveredCard={this.state.hoveredCard} />
          </div>
        </div>
      </div>
    );
  }
}

const { array } = React.PropTypes;

Decks.propTypes = {
  decks: array
};

export default connect(mapStateToProps, mapDispatchToProps)(Decks);
