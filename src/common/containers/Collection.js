import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Paper from 'material-ui/lib/paper';
import SelectField from 'material-ui/lib/SelectField';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Toggle from 'material-ui/lib/toggle';
import { Range } from 'rc-slider';

import Card from '../components/game/Card';

function mapStateToProps(state) {
  return {
    cards: state.collection.cards
  };
}

function mapDispatchToProps(dispatch) {
  return {};
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
      sortingOrder: 0
    };
  }

  sortCards(a, b) {
    switch (this.state.sortingCriteria) {
      case 0: // By cost
        if (this.state.sortingOrder) {
          if (a.cost > b.cost)
            return -1;
          else if (a.cost < b.cost)
            return 1;
          else
            return 0;
        } else {
          if (a.cost < b.cost)
            return -1;
          else if (a.cost > b.cost)
            return 1;
          else
            return 0;
        }
      case 1: // By name
        if (this.state.sortingOrder) {
          if (a.name > b.name)
            return -1;
          else if (a.name < b.name)
            return 1;
          else
            return 0;
        } else {
          if (a.name < b.name)
            return -1;
          else if (a.name > b.name)
            return 1;
          else
            return 0;
        }
      case 2: // By type
        if (this.state.sortingOrder) {
          if (a.type > b.type)
            return -1;
          else if (a.type < b.type)
            return 1;
          else
            return 0;
        } else {
          if (a.type < b.type)
            return -1;
          else if (a.type > b.type)
            return 1;
          else
            return 0;
        }
      case 3: // By creator
        return 0;
    }
  }

  filterCards(card) {
    if (!this.state.filters.robots && card.type === 0) {
      return false;
    }

    if (!this.state.filters.events && card.type === 1) {
      return false;
    }

    if (!this.state.filters.structures && card.type === 3) {
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

    return (
      <div style={{paddingLeft: 256, /*paddingRight: 256,*/ paddingTop: 64, height: '100%'}}>
        <Helmet title="Collection"/>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            width: '80%',
            margin: 50
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
                    scale={1} />
              )
            }
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
  cards: React.PropTypes.array
};

export default connect(mapStateToProps, mapDispatchToProps)(Collection);
