import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { pushState } from 'redux-router';
import Paper from 'material-ui/lib/paper';
import FontIcon from 'material-ui/lib/font-icon';
import RaisedButton from 'material-ui/lib/raised-button';

import { isCardVisible, sortFunctions } from '../util/cards';
import CardGrid from '../components/cards/CardGrid';
import FilterControls from '../components/cards/FilterControls';
import SortControls from '../components/cards/SortControls';
import CardBack from '../components/game/CardBack';
import * as collectionActions from '../actions/collection';

function mapStateToProps(state) {
  return {
    cards: state.collection.cards
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onEditCard: (card) => {
      dispatch([
        collectionActions.openForEditing(card),
        pushState(null, '/creator')
      ]);
    },
    onRemoveFromCollection: (cards) => {
      dispatch(collectionActions.removeFromCollection(cards));
    }
  };
}

class Collection extends Component {
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
      selectedCardIds: []
    };
  }

  isCardVisible(card) {
    return isCardVisible(card, this.state.filters, this.state.costRange);
  }

  updateState(newProps, callback = () => {}) {
    this.setState((s =>
      Object.assign({}, s, _.isFunction(newProps) ? newProps(s) : newProps)
    ), callback);
  }

  updateSelectedCardsWithFilter() {
    this.updateState(state => (
      {selectedCardIds: state.selectedCardIds.filter(id => this.isCardVisible(this.props.cards.find(c => c.id === id)))}
    ));
  }

  toggleFilter(filter) {
    return (e, toggled) => {
      this.updateState(
        state => ({filters: Object.assign({}, state.filters, {[filter]: toggled})}),
        () => { this.updateSelectedCardsWithFilter(); }
      );
    };
  }

  render() {
    return (
      <div style={{height: '100%'}}>
        <Helmet title="Collection"/>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{marginTop: 50, marginLeft: 40}}>
            <CardGrid
              cards={this.props.cards}
              selectedCardIds={this.state.selectedCardIds}
              filterFunc={this.isCardVisible.bind(this)}
              sortFunc={sortFunctions[this.state.sortingCriteria]}
              sortOrder={this.state.sortingOrder}
              onCardClick={card => {
                if (card.source !== 'builtin') {
                  this.updateState(state => {
                    if (state.selectedCardIds.includes(card.id)) {
                      return {selectedCardIds: _.without(state.selectedCardIds, card.id)};
                    } else {
                      return {selectedCardIds: [...state.selectedCardIds, card.id]};
                    }
                  });
                }
              }}>
              <Link to="/creator">
                <div style={{padding: '24px 0 12px 0', marginRight: 15}}>
                  <CardBack hoverable customText="New Card" />
                </div>
              </Link>
            </CardGrid>
          </div>

          <div style={{
            margin: 50,
            marginLeft: 0,
            minWidth: '18%'
          }}>
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
                onSetCostRange={values => {
                  this.updateState({costRange: values}, () => { this.updateSelectedCardsWithFilter(); });
                }} />
            </Paper>

            <RaisedButton
              label="Edit Selected"
              labelPosition="before"
              secondary
              disabled={this.state.selectedCardIds.length !== 1}
              icon={<FontIcon className="material-icons">edit</FontIcon>}
              style={{width: '100%', marginTop: 20}}
              onClick={() => {
                const id = this.state.selectedCardIds[0];
                this.props.onEditCard(this.props.cards.find(c => c.id === id));
              }}
            />
            <RaisedButton
              label="Delete Selected"
              labelPosition="before"
              secondary
              disabled={this.state.selectedCardIds.length === 0}
              icon={<FontIcon className="material-icons">delete</FontIcon>}
              style={{width: '100%', marginTop: 20}}
              onClick={() => {
                this.props.onRemoveFromCollection(this.state.selectedCardIds);
                this.updateState({selectedCardIds: []});
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

const { array, func } = React.PropTypes;

Collection.propTypes = {
  cards: array,

  onEditCard: func,
  onRemoveFromCollection: func
};

export default connect(mapStateToProps, mapDispatchToProps)(Collection);
