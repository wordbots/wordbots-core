import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Paper from 'material-ui/lib/paper';
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
      manaRange: [0, 20]
    };
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
          justifyContent: 'space-between'
        }}>
          <Paper style={{
            margin: 50,
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
                  manaRange: this.state.manaRange
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
                  manaRange: this.state.manaRange
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
                  manaRange: this.state.manaRange
                })}/>
            </div>

            <div>
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
                    manaRange: values
                  })
                }/>
              </div>
            </div>
          </Paper>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            width: '70%',
            margin: '50px auto'
          }}>
            {
              this.props.cards.filter(this.filterCards.bind(this)).map(card =>
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
                  scale={1}
                  />
              )
            }
          </div>
        </div>
      </div>
    );
  }
}

Collection.propTypes = {
  cards: React.PropTypes.array
};

export default connect(mapStateToProps, mapDispatchToProps)(Collection);
