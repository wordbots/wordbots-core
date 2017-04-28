import React, { Component } from 'react';
import { array, bool, func, object, string } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';
import { compact } from 'lodash';

import { isCardVisible, sortFunctions } from '../util/cards';
import ActiveDeck from '../components/cards/ActiveDeck';
import EnergyCurve from '../components/cards/EnergyCurve';
import CardCollection from '../components/cards/CardCollection';
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
      searchText: '',
      selectedCardIds: props.deck ? props.deck.cardIds : [],
      layout: 0
    };
  }

  selectedCards() {
    return compact(this.state.selectedCardIds.map(id => this.props.cards.find(c => c.id === id)));
  }

  isCardVisible(card) {
    return isCardVisible(card, this.state.filters, this.state.costRange);
  }

  updateSelectedCardsWithFilter() {
    this.setState(state => (
      {selectedCardIds: state.selectedCardIds.filter(id => this.isCardVisible(this.props.cards.find(c => c.id === id)))}
    ));
  }

  toggleFilter(filter) {
    return (e, toggled) => {
      this.setState(s => ({filters: Object.assign({}, s.filters, {[filter]: toggled})}));
    };
  }

  searchCards(card) {
    const query = this.state.searchText.toLowerCase();
    return card.name.toLowerCase().includes(query) || (card.text || '').toLowerCase().includes(query);
  }

  sortCards(a, b) {
    const f = sortFunctions[this.state.sortingCriteria];

    if (f(a) < f(b)) {
      return this.state.sortingOrder ? 1 : -1;
    } else if (f(a) > f(b)) {
      return this.state.sortingOrder ? -1 : 1;
    } else {
      return 0;
    }
  }

  renderCardCollection() {
    const cards = this.props.cards
      .filter(this.searchCards.bind(this))
      .filter(this.isCardVisible.bind(this))
      .sort(this.sortCards.bind(this));

    return (
      <CardCollection
        allowMultipleSelection
        layout={this.state.layout}
        cards={cards}
        selectedCardIds={this.state.selectedCardIds}
        onSelection={selectedCards => this.setState({selectedCardIds: selectedCards})} />
    );
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
          <div style={{marginTop: 10, marginLeft: 40, width: '100%'}}>
            {this.renderCardCollection()}
          </div>

          <div style={{
            margin: '30px 50px 50px 0',
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

            <Paper style={{
              padding: 20,
              marginBottom: 20
            }}>
              <div style={{
                fontWeight: 100,
                fontSize: 28
              }}>Energy Curve</div>

              <EnergyCurve
                cards={this.selectedCards()} />
            </Paper>

            <Paper style={{
              padding: 20
            }}>
              <div style={{
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 20
              }}>Layout</div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                marginBottom: 20
              }}>
                <FontIcon
                  className="material-icons"
                  style={{
                    color: this.state.layout === 0 ? 'white' : 'black',
                    fontSize: 36,
                    padding: 10,
                    borderRadius: 3,
                    boxShadow: '1px 1px 3px #CCC',
                    backgroundColor: this.state.layout === 0 ? '#F44336' : '#EEEEEE',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'center',
                    marginRight: 10
                  }}
                  onClick={() => { this.setState({layout: 0});}}>
                  view_module
                </FontIcon>
                <FontIcon
                  className="material-icons"
                  style={{
                    color: this.state.layout === 0 ? 'black' : 'white',
                    fontSize: 36,
                    padding: 10,
                    borderRadius: 3,
                    boxShadow: '1px 1px 3px #CCC',
                    backgroundColor: this.state.layout === 0 ? '#EEEEEE' : '#F44336',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'center'
                  }}
                  onClick={() => { this.setState({layout: 1});}}>
                  view_list
                </FontIcon>
              </div>

              <div style={{
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 10
              }}>Search</div>

              <TextField
                hintText="Enter card name or text"
                style={{marginBottom: 10}}
                onChange={(event, newValue) => { this.setState({searchText: newValue}); }}/>

              <SortControls
                criteria={this.state.sortingCriteria}
                order={this.state.sortingOrder}
                onSetCriteria={value => { this.setState({sortingCriteria: value}); }}
                onSetOrder={value => { this.setState({sortingOrder: value}); }} />

              <FilterControls
                onToggleFilter={this.toggleFilter.bind(this)}
                onSetCostRange={values => {
                  this.setState({costRange: values}, () => { this.updateSelectedCardsWithFilter(); });
                }} />
            </Paper>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Deck));
