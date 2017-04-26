import React, { Component } from 'react';
import { array, bool, func, object, string } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Paper from 'material-ui/Paper';
import { compact, isFunction } from 'lodash';

import { isCardVisible, sortFunctions } from '../util/cards';
import ActiveDeck from '../components/cards/ActiveDeck';
import EnergyCurve from '../components/cards/EnergyCurve';
import CardGrid from '../components/cards/CardGrid';
import FilterControls from '../components/cards/FilterControls';
import SortControls from '../components/cards/SortControls';
import * as collectionActions from '../actions/collection';

function mapStateToProps(state) {
  return {
    id: state.collection.currentDeck ? state.collection.currentDeck.id : null,
    cards: state.collection.cards,
    deck: state.collection.currentDeck,
    loggedIn: state.global.user !== null,
    sidebarOpen: state.global.sidebarOpen
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onSaveDeck: function (id, name, cardIds) {
      dispatch(collectionActions.saveDeck(id, name, cardIds));
    }
  };
}

class Deck extends Component {
  static propTypes = {
    id: string,
    cards: array,
    deck: object,
    loggedIn: bool,
    sidebarOpen: bool,

    history: object,

    onSaveDeck: func
  };

  constructor(props) {
    super(props);

    this.state = {
      filters: {
        robots: true,
        events: true,
        structures: true
      },
      costRange: [0, 20],
      sortingCriteria: 3,
      sortingOrder: 0,
      selectedCardIds: props.deck ? props.deck.cards.map(c => c.id) : []
    };
  }

  selectedCards() {
    return compact(this.state.selectedCardIds.map(id => this.props.cards.find(c => c.id === id)));
  }

  updateState(newProps) {
    this.setState(s =>
      Object.assign({}, s, isFunction(newProps) ? newProps(s) : newProps)
    );
  }

  toggleFilter(filter) {
    return (e, toggled) => {
      this.updateState(s => ({filters: Object.assign({}, s.filters, {[filter]: toggled})}));
    };
  }

  render() {
    return (
      <div style={{height: '100%', paddingLeft: this.props.sidebarOpen ? 256 : 0}}>
        <Helmet title="Building Deck"/>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{marginTop: 50, marginLeft: 40}}>
            <CardGrid
              cards={this.props.cards}
              filterFunc={c => isCardVisible(c, this.state.filters, this.state.costRange)}
              sortFunc={sortFunctions[this.state.sortingCriteria]}
              sortOrder={this.state.sortingOrder}
              onCardClick={id => {
                this.updateState(state => ({selectedCardIds: [...state.selectedCardIds, id]}));
              }} />
          </div>

          <div style={{
            margin: 50,
            marginLeft: 0,
            width: 300,
            minWidth: 300
          }}>
            <Paper style={{
              padding: 20,
              marginBottom: 20
            }}>
              <ActiveDeck
                id={this.props.id}
                name={this.props.deck ? this.props.deck.name : ''}
                cards={this.selectedCards()}
                loggedIn={this.props.loggedIn}
                onCardClick={id => {
                  this.updateState(state => {
                    state.selectedCardIds.splice(state.selectedCardIds.indexOf(id), 1);
                    return state;
                  });
                }}
                onSaveDeck={(id, name, cardIds) => {
                  this.props.onSaveDeck(id, name, cardIds);
                  this.props.history.push('/decks');
                }} />
            </Paper>

            <Paper style={{
              padding: 20,
              marginBottom: 20
            }}>
              <EnergyCurve
                cards={this.selectedCards()} />
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
                onSetCostRange={values => { this.updateState({costRange: values}); }} />
            </Paper>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Deck));
