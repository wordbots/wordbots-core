import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { pushState } from 'redux-router';
import Paper from 'material-ui/lib/paper';
import FontIcon from 'material-ui/lib/font-icon';
import TextField from 'material-ui/lib/text-field';
import SelectField from 'material-ui/lib/SelectField';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Toggle from 'material-ui/lib/toggle';
import RaisedButton from 'material-ui/lib/raised-button';
import { Range } from 'rc-slider';

import { TYPE_ROBOT, TYPE_EVENT, TYPE_STRUCTURE, typeToString } from '../constants';
import { splitSentences } from '../util';
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

  filterCards(card) {
    if (!this.state.filters.robots && card.type === TYPE_ROBOT) {
      return false;
    }

    if (!this.state.filters.events && card.type === TYPE_EVENT) {
      return false;
    }

    if (!this.state.filters.structures && card.type === TYPE_STRUCTURE) {
      return false;
    }

    if (card.cost < this.state.manaRange[0] || card.cost > this.state.manaRange[1]) {
      return false;
    }

    return true;
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

  renderSortControls() {
    return (
      <div style={{
        marginBottom: 20
      }}>
        <div style={{
          fontWeight: 700,
          fontSize: 14
        }}>Sorting</div>

        <SelectField
          style={{width: '100%'}}
          value={this.state.sortingCriteria}
          floatingLabelText="Criteria"
          onChange={(e, i, value) => { this.updateState({sortingCriteria: value}); }}>
          <MenuItem value={0} primaryText="By Cost"/>
          <MenuItem value={1} primaryText="By Name"/>
          <MenuItem value={2} primaryText="By Type"/>
          <MenuItem value={3} primaryText="By Creator"/>
        </SelectField>
        <SelectField
          style={{width: '100%'}}
          value={this.state.sortingOrder}
          floatingLabelText="Order"
          onChange={(e, i, value) => { this.updateState({sortingOrder: value}); }}>
          <MenuItem value={0} primaryText="Ascending"/>
          <MenuItem value={1} primaryText="Descending"/>
        </SelectField>
      </div>
    );
  }

  renderFilterControls() {
    const toggleStyle = {
      marginBottom: 10
    };

    return [
      <div style={{
        marginBottom: 20
      }}>
        <div style={{
          fontWeight: 700,
          fontSize: 14,
          marginBottom: 10
        }}>Card Types</div>

        <Toggle
          style={toggleStyle}
          label="Robots"
          defaultToggled
          onToggle={this.toggleFilter('robots')} />
        <Toggle
          style={toggleStyle}
          label="Events"
          defaultToggled
          onToggle={this.toggleFilter('events')} />
        <Toggle
          style={toggleStyle}
          label="Structures"
          defaultToggled
          onToggle={this.toggleFilter('structures')} />
      </div>,

      <div style={{
        marginBottom: 20
      }}>
        <div style={{
          fontWeight: 700,
          fontSize: 14,
          marginBottom: 20
        }}>Card Cost</div>

        <div>
          <Range
            step={1}
            allowCross={false}
            min={0}
            max={20}
            marks={{
              0: 0,
              5: 5,
              10: 10,
              15: 15,
              20: 20
            }}
            defaultValue={[0, 20]}
            onChange={values => { this.updateState({manaRange: values}); }}
          />
        </div>
      </div>
    ];
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
                  .filter(this.filterCards.bind(this))
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
            </Paper>

            <Paper style={{
              padding: 20
            }}>
              <div style={{
                fontWeight: 100,
                fontSize: 28,
                marginBottom: 20
              }}>Filters</div>

              {this.renderSortControls()}
              {this.renderFilterControls()}
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
