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
      sortingCriteria: 0,
      sortingOrder: 0,
      selectedCards: []
    };
  }

  sortCards(a, b) {
    const sortFuncs = [
      x => x.cost,
      x => x.name,
      x => [typeToString(x.type), x.cost],
      x => [x.source === 'builtin', x.cost]
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

  render() {
    const toggleStyle = {
      marginBottom: 10
    };

    function deleteButton() {
      if (this.state.selectedCards.length > 0) {
        return (
          <RaisedButton
            label="Delete Selected"
            labelPosition="before"
            secondary
            icon={<FontIcon className="material-icons">delete</FontIcon>}
            style={{width: 300, margin: '0 50px'}}
            onClick={() => { this.props.onRemoveFromCollection(this.state.selectedCards); }}
          />
        );
      }
    }

    return (
      <div style={{paddingLeft: 256, /*paddingRight: 256,*/ paddingTop: 64, height: '100%'}}>
        <Helmet title="Collection"/>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{marginTop: 50}}>
            {deleteButton.bind(this)()}

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              width: '80%',
              margin: 50,
              marginTop: 10
            }}>
              {
                this.props.cards
                  .filter(this.filterCards.bind(this))
                  .sort(this.sortCards.bind(this))
                  .map(card =>
                    <Card
                      key={card.id}
                      visible
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
                          this.setState(state => {
                            if (state.selectedCards.includes(card.id)) {
                              return Object.assign({}, state, {selectedCards: _.without(state.selectedCards, card.id)});
                            } else {
                              return Object.assign({}, state, {selectedCards: [...state.selectedCards, card.id]});
                            }
                          });
                        }
                      }} />
                )
              }
            </div>
          </div>

          <Paper style={{
            margin: 50,
            marginLeft: 0,
            padding: 20,
            width: '18%'
          }}>
            <div style={{
              fontWeight: 100,
              fontSize: 28,
              marginBottom: 20
            }}>Filters</div>

            <div style={{
              marginBottom: 20
            }}>
              <div style={{
                fontWeight: 700,
                fontSize: 14
              }}>Sorting</div>

              <SelectField
                style={{
                  width: '100%'
                }}
                value={this.state.sortingCriteria}
                floatingLabelText="Criteria"
                onChange={(e, i, value) => {
                  this.setState({
                    filters: this.state.filters,
                    manaRange: this.state.manaRange,
                    sortingCriteria: value,
                    sortingOrder: this.state.sortingOrder
                  });
                }}>
                <MenuItem value={0} primaryText="By Cost"/>
                <MenuItem value={1} primaryText="By Name"/>
                <MenuItem value={2} primaryText="By Type"/>
                <MenuItem value={3} primaryText="By Creator"/>
              </SelectField>
              <SelectField
                style={{
                  width: '100%'
                }}
                value={this.state.sortingOrder}
                floatingLabelText="Order"
                onChange={(e, i, value) => {
                  this.setState({
                    filters: this.state.filters,
                    manaRange: this.state.manaRange,
                    sortingCriteria: this.state.sortingCriteria,
                    sortingOrder: value
                  });
                }}>
                <MenuItem value={0} primaryText="Ascending"/>
                <MenuItem value={1} primaryText="Descending"/>
              </SelectField>
            </div>

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
                onToggle={(event, toggled) => this.setState({
                  filters: {
                    robots: toggled,
                    events: this.state.filters.events,
                    structures: this.state.filters.structures
                  },
                  manaRange: this.state.manaRange,
                  sortingCriteria: this.state.sortingCriteria,
                  sortingOrder: this.state.sortingOrder
                })}/>
              <Toggle
                style={toggleStyle}
                label="Events"
                defaultToggled
                onToggle={(event, toggled) => this.setState({
                  filters: {
                    robots: this.state.filters.robots,
                    events: toggled,
                    structures: this.state.filters.structures
                  },
                  manaRange: this.state.manaRange,
                  sortingCriteria: this.state.sortingCriteria,
                  sortingOrder: this.state.sortingOrder
                })}/>
              <Toggle
                style={toggleStyle}
                label="Structures"
                defaultToggled
                onToggle={(event, toggled) => this.setState({
                  filters: {
                    robots: this.state.filters.robots,
                    events: this.state.filters.events,
                    structures: toggled
                  },
                  manaRange: this.state.manaRange,
                  sortingCriteria: this.state.sortingCriteria,
                  sortingOrder: this.state.sortingOrder
                })}/>
            </div>

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
                  onChange={(values) => this.setState({
                    filters: this.state.filters,
                    manaRange: values,
                    sortingCriteria: this.state.sortingCriteria,
                    sortingOrder: this.state.sortingOrder
                  })
                }/>
              </div>
            </div>
          </Paper>
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
