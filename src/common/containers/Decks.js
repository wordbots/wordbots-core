import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Badge from 'material-ui/lib/badge';
import Paper from 'material-ui/lib/paper';

import { TYPE_ROBOT, TYPE_EVENT, TYPE_STRUCTURE } from '../constants';
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

  renderCard(card) {
    const isHovered = this.state.hoveredCard && this.state.hoveredCard.card.id === card.id;

    return (
      <div
        key={card.name}
        onMouseOver={e => this.onHover(card)}
        style={{
          backgroundColor: isHovered ? '#eee' : '#fff'
      }}>
        <Badge
          badgeContent={card.cost}
          badgeStyle={{backgroundColor: '#00bcd4', fontFamily: 'Carter One', color: 'white', marginRight: 5}}
          style={{padding: 0, width: 24, height: 20 }} />
        {card.name}
      </div>
    );
  }

  renderCards(cards) {
    return _.sortBy(cards, c => [c.cost, c.name])
            .map(this.renderCard.bind(this));
  }

  renderDeck(deck) {
    const robots = deck.cards.filter(c => c.type === TYPE_ROBOT);
    const structures = deck.cards.filter(c => c.type === TYPE_STRUCTURE);
    const events = deck.cards.filter(c => c.type === TYPE_EVENT);

    return (
      <Paper key={deck.name} style={{padding: 10}}>
        <h3 style={{margin: '5px 0 0'}}>{deck.name}</h3>

        <div style={{float: 'left', marginRight: 10}}>
          <h4>Robots ({robots.length})</h4>
          {this.renderCards(robots)}
        </div>

        <div style={{float: 'left'}}>
          <h4>Structures ({structures.length})</h4>
          {this.renderCards(structures)}

          <h4>Events ({events.length})</h4>
          {this.renderCards(events)}
        </div>
      </Paper>
    );
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
                this.props.decks.map(this.renderDeck.bind(this))
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
