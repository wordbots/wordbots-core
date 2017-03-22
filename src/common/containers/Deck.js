import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { pushState } from 'redux-router';
import Paper from 'material-ui/lib/paper';

import { TYPE_ROBOT, TYPE_EVENT, TYPE_STRUCTURE } from '../constants';
import { sortFunctions } from '../util';
import ActiveDeck from '../components/cards/ActiveDeck';
import CardGrid from '../components/cards/CardGrid';
import FilterControls from '../components/cards/FilterControls';
import SortControls from '../components/cards/SortControls';
import * as collectionActions from '../actions/collection';

function mapStateToProps(state) {
  return {
    id: state.collection.currentDeck ? state.collection.currentDeck.id : null,
    cards: state.collection.cards,
    deck: state.collection.currentDeck
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onSaveDeck: function (id, name, cardIds) {
      dispatch([
        collectionActions.saveDeck(id, name, cardIds),
        pushState(null, '/decks')
      ]);
    }
  };
}

class Deck extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filters: {
        robots: true,
        events: true,
        structures: true
      },
      manaRange: [0, 20],
      sortingCriteria: 3,
      sortingOrder: 0,
      selectedCards: props.deck ? props.deck.cards.map(c => c.id) : []
    };
  }

  updateState(newProps) {
    this.setState(s =>
      Object.assign({}, s, _.isFunction(newProps) ? newProps(s) : newProps)
    );
  }

  toggleFilter(filter) {
    return (e, toggled) => {
      this.updateState(s => ({filters: Object.assign({}, s.filters, {[filter]: toggled})}));
    };
  }

  cardIsVisible(card) {
    if ((!this.state.filters.robots && card.type === TYPE_ROBOT) ||
        (!this.state.filters.events && card.type === TYPE_EVENT) ||
        (!this.state.filters.structures && card.type === TYPE_STRUCTURE) ||
        (card.cost < this.state.manaRange[0] || card.cost > this.state.manaRange[1])) {
      return false;
    } else {
      return true;
    }
  }

  render() {
    return (
      <div style={{height: '100%'}}>
        <Helmet title="Building Deck"/>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{marginTop: 50, marginLeft: 40}}>
            <CardGrid
              cards={this.props.cards}
              filterFunc={this.cardIsVisible.bind(this)}
              sortFunc={sortFunctions[this.state.sortingCriteria]}
              sortOrder={this.state.sortingOrder}
              onCardClick={card => { this.updateState(state => ({selectedCards: [...state.selectedCards, card.id]})); }} />
          </div>

          <div style={{
            margin: 50,
            marginLeft: 0,
            minWidth: '18%'
          }}>
            <Paper style={{
              padding: 20,
              marginBottom: 20
            }}>
              <ActiveDeck
                id={this.props.id}
                name={this.props.deck ? this.props.deck.name : ''}
                cards={this.state.selectedCards.map(id => this.props.cards.find(c => c.id === id))}
                onCardClick={idx => {
                  this.updateState(state => {
                    state.selectedCards.splice(idx, 1);
                    return state;
                  });
                }}
                onSaveDeck={this.props.onSaveDeck} />
            </Paper>

            <Paper style={{
              padding: 20
            }}>
              <div style={{
                fontWeight: 100,
                fontSize: 28,
                marginBottom: 20
              }}>Filters</div>

              <SortControls
                criteria={this.state.sortingCriteria}
                order={this.state.sortingOrder}
                onSetCriteria={value => { this.updateState({sortingCriteria: value}); }}
                onSetOrder={value => { this.updateState({sortingOrder: value}); }}
                />
              <FilterControls
                onToggleFilter={this.toggleFilter.bind(this)}
                onSetCostRange={values => { this.updateState({manaRange: values}); }} />
            </Paper>
          </div>
        </div>
      </div>
    );
  }
}

const { array, func, object, string } = React.PropTypes;

Deck.propTypes = {
  id: string,
  cards: array,
  deck: object,

  onSaveDeck: func
};

export default connect(mapStateToProps, mapDispatchToProps)(Deck);
