import React, { Component } from 'react';
import { array, bool, func, object, string } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Paper from 'material-ui/Paper';
import { compact, find, pick } from 'lodash';

import { getDisplayedCards } from '../util/cards';
import ActiveDeck from '../components/cards/ActiveDeck';
import CardCollection from '../components/cards/CardCollection';
import EnergyCurve from '../components/cards/EnergyCurve';
import FilterControls from '../components/cards/FilterControls';
import LayoutControls from '../components/cards/LayoutControls';
import SearchControls from '../components/cards/SearchControls';
import SortControls from '../components/cards/SortControls';
import * as collectionActions from '../actions/collection';

function mapStateToProps(state) {
  return {
    id: state.collection.currentDeck ? state.collection.currentDeck.id : null,
    cards: state.collection.cards,
    deck: state.collection.currentDeck,
    loggedIn: state.global.user !== null
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
      sortCriteria: 3,
      sortOrder: 0,
      searchText: '',
      selectedCardIds: props.deck ? props.deck.cardIds : [],
      layout: 0
    };
  }

  get selectedCards() {
    return compact(this.state.selectedCardIds.map(id => find(this.props.cards, { id })));
  }

  get displayedCards() {
    const opts = pick(this.state, ['searchText', 'filters', 'costRange', 'sortCriteria', 'sortOrder']);
    return getDisplayedCards(this.props.cards, opts);
  }

  toggleFilter = (filter) => (e, toggled) => {
    this.setState(state => ({
      filters: Object.assign({}, state.filters, {[filter]: toggled})
    }));
  }

  renderSidebarControls() {
    return (
      <Paper style={{padding: 20, marginBottom: 10}}>
        <SearchControls
          onChange={value => { this.setState({searchText: value}); }} />

        <LayoutControls
          layout={this.state.layout}
          onSetLayout={value => { this.setState({layout: value}); }} />

        <SortControls
          criteria={this.state.sortingCriteria}
          order={this.state.sortingOrder}
          onSetCriteria={value => { this.setState({sortingCriteria: value}); }}
          onSetOrder={value => { this.setState({sortingOrder: value}); }} />

        <FilterControls
          onToggleFilter={this.toggleFilter}
          onSetCostRange={values => { this.setState({costRange: values}); }} />
      </Paper>
    );
  }

  render() {
    return (
      <div>
        <Helmet title="Building Deck"/>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{marginTop: 10, marginLeft: 40, width: '100%'}}>
            <CardCollection
              allowMultipleSelection
              layout={this.state.layout}
              cards={this.displayedCards}
              selectedCardIds={this.state.selectedCardIds}
              onSelection={selectedCards => this.setState({selectedCardIds: selectedCards})} />
          </div>

          <div style={{
            margin: '30px 50px 50px 0',
            width: 300,
            minWidth: 300
          }}>
            <Paper style={{padding: 20, marginBottom: 20}}>
              <ActiveDeck
                id={this.props.id}
                name={this.props.deck ? this.props.deck.name : ''}
                cards={this.selectedCards}
                loggedIn={this.props.loggedIn}
                onCardClick={id => {
                  this.setState(state => {
                    state.selectedCardIds.splice(state.selectedCardIds.indexOf(id), 1);
                    return state;
                  });
                }}
                onSaveDeck={(id, name, cardIds) => {
                  this.props.onSaveDeck(id, name, cardIds);
                  this.props.history.push('/decks');
                }} />
            </Paper>

            <Paper style={{padding: 20, marginBottom: 20}}>
              <div style={{fontWeight: 100, fontSize: 28}}>Energy Curve</div>
              <EnergyCurve cards={this.selectedCards} />
            </Paper>

            {this.renderSidebarControls()}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Deck));
