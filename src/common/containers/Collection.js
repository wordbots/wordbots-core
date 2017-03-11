import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Paper from 'material-ui/lib/paper';
import FontIcon from 'material-ui/lib/font-icon';
import SelectField from 'material-ui/lib/SelectField';
import RaisedButton from 'material-ui/lib/raised-button';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Toggle from 'material-ui/lib/toggle';
import { Range } from 'rc-slider';

import { TYPE_ROBOT, TYPE_EVENT, TYPE_STRUCTURE, typeToString } from '../constants';
import Card from '../components/game/Card';
import * as collectionActions from '../actions/collection';

function mapStateToProps(state) {
  return {
    cards: state.collection.cards
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onRemoveFromCollection: (props) => {
      dispatch(collectionActions.removeFromCollection(props));
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
        text={card.text || ''}
        stats={card.stats}
        cardStats={card.stats}
        cost={card.cost}
        baseCost={card.cost}
        source={card.source}
        scale={1}
        selected={this.state.selectedCards.includes(card.id)}
        onCardClick={e => {
          if (card.source !== 'builtin') {
            this.updateState(state => {
              if (state.selectedCards.includes(card.id)) {
                return {selectedCards: _.without(state.selectedCards, card.id)};
              } else {
                return {selectedCards: [...state.selectedCards, card.id]};
              }
            });
          }
        }} />
    );
  }

  renderDeleteButton() {
    if (this.state.selectedCards.length > 0) {
      return (
        <RaisedButton
          label="Delete Selected"
          labelPosition="before"
          secondary
          icon={<FontIcon className="material-icons">delete</FontIcon>}
          style={{width: '100%', marginTop: 20}}
          onClick={() => { this.props.onRemoveFromCollection(this.state.selectedCards); }}
        />
      );
    }
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
      <div style={{paddingLeft: 256, /*paddingRight: 256,*/ paddingTop: 64, height: '100%'}}>
        <Helmet title="Collection"/>

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

            {this.renderDeleteButton()}
          </div>
        </div>
      </div>
    );
  }
}

Collection.propTypes = {
  cards: React.PropTypes.array,

  onRemoveFromCollection: React.PropTypes.func
};

export default connect(mapStateToProps, mapDispatchToProps)(Collection);
