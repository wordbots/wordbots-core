import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { pushState } from 'redux-router';
import Paper from 'material-ui/lib/paper';
import FontIcon from 'material-ui/lib/font-icon';
import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';

import { TYPE_ROBOT, TYPE_EVENT, TYPE_STRUCTURE, typeToString } from '../constants';
import { splitSentences } from '../util';
import FilterControls from '../components/cards/FilterControls';
import SortControls from '../components/cards/SortControls';
import Sentence from '../components/cards/Sentence';
import Card from '../components/game/Card';
import * as collectionActions from '../actions/collection';

function mapStateToProps(state) {
  return {
    cards: state.collection.cards
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
      deckName: '',
      filters: {
        robots: true,
        events: true,
        structures: true
      },
      manaRange: [0, 20],
      sortingCriteria: 3,
      sortingOrder: 0,
      selectedCards: []
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

  sortCards(a, b) {
    const sortFuncs = [ // 0 = cost, 1 = name, 2 = type, 3 = source
      c => [c.cost, c.name],
      c => c.name,
      c => [typeToString(c.type), c.cost, c.name],
      c => [c.source === 'builtin', c.cost, c.name]
    ];
    const func = sortFuncs[this.state.sortingCriteria];

    if (func(a) < func(b)) {
      return this.state.sortingOrder ? 1 : -1;
    } else if (func(a) > func(b)) {
      return this.state.sortingOrder ? -1 : 1;
    } else {
      return 0;
    }
  }

  renderCard(card) {
    return (
      <Card
        visible
        collection
        key={card.id}
        name={card.name}
        spriteID={card.spriteID}
        type={card.type}
        text={splitSentences(card.text).map(Sentence)}
        rawText={card.text || ''}
        stats={card.stats}
        cardStats={card.stats}
        cost={card.cost}
        baseCost={card.cost}
        source={card.source}
        scale={1}
        onCardClick={e => {
          this.updateState(state => ({selectedCards: [...state.selectedCards, card.id]}));
        }}
        onCardHover={() => {}} />
    );
  }

  renderDeck() {
    return (
      <div>
        <div style={{
          fontWeight: 100,
          fontSize: 28
        }}>
          Deck&nbsp;
          <span style={{color: (this.state.selectedCards.length === 30) ? 'green' : 'red'}}>
            [{this.state.selectedCards.length}]
          </span>
        </div>

        <TextField
          value={this.state.deckName}
          floatingLabelText="Deck Name"
          style={{width: '100%'}}
          onChange={e => { this.updateState({deckName: e.target.value}); }} />

        {this.state.selectedCards.map((cardId, idx) =>
          <div
            style={{cursor: 'pointer'}}
            onClick={e => {
              this.updateState(state => {
                state.selectedCards.splice(idx, 1);
                return state;
              });
            }}>
            [x] {this.props.cards.find (c => c.id === cardId).name}
          </div>
        )}

        <RaisedButton
          label="Save Deck"
          labelPosition="before"
          secondary
          disabled={this.state.deckName === '' /*|| this.state.selectedCards.length !== 30*/}
          icon={<FontIcon className="material-icons">save</FontIcon>}
          style={{width: '100%', marginTop: 20}}
          onClick={ e => {
            this.props.onSaveDeck(this.props.id, this.state.deckName, this.state.selectedCards);
          } }
        />
      </div>
    );
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
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              width: '100%',
              margin: 10
            }}>
              {
                this.props.cards
                  .filter(this.cardIsVisible.bind(this))
                  .sort(this.sortCards.bind(this))
                  .map(this.renderCard.bind(this))
              }
            </div>
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
              {this.renderDeck()}
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

const { array, func, string } = React.PropTypes;

Deck.propTypes = {
  id: string,
  cards: array,

  onSaveDeck: func
};

export default connect(mapStateToProps, mapDispatchToProps)(Deck);
