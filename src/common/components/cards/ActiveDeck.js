import React, { Component } from 'react';
import { array, bool, func, string } from 'prop-types';
import FontIcon from 'material-ui/FontIcon';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'react-popover';
import { sortBy } from 'lodash';

import { groupCards, selectType, splitSentences } from '../../util/cards';
import MustBeLoggedIn from '../users/MustBeLoggedIn';
import Card from '../card/Card';
import Sentence from '../card/Sentence';

// Widget representing the deck currently being created or modified.
export default class ActiveDeck extends Component {
  static propTypes = {
    id: string,
    cards: array,
    name: string,
    loggedIn: bool,

    onCardClick: func,
    onSaveDeck: func
  }

  constructor(props) {
    super(props);

    this.state = {
      name: props.name,
      hoveredRow: null,
      hoveredSection: null,
      grouping: 0
    };
  }

  get styles() {
    return {
      popover: {
        zIndex: 99999
      },
      outerCard: {
        display: 'flex',
        alignItems: 'stretch',
        cursor: 'pointer',
        height: 30,
        marginBottom: -2,
        borderRadius: 5,
        border: '2px solid #444'
      },
      cardCost: {
        width: 30,
        color: 'white',
        fontFamily: 'Carter One',
        backgroundColor: '#00bcd4',
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
        borderRight: '2px solid #444'
      },
      cardName: {
        width: 'calc(100% - 30px)',
        marginLeft: 5,
        display: 'flex',
        alignItems: 'center'
      },
      cardCount: {
        width: 30,
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      baseIcon: {
        fontSize: 36,
        padding: 10,
        borderRadius: 3,
        boxShadow: '1px 1px 3px #CCC',
        cursor: 'pointer',
        width: '40%',
        textAlign: 'center'
      }
    };
  }

  renderButton(grouping, iconName) {
    const selected = (this.state.grouping === grouping);

    return (
      <FontIcon
        className="material-icons"
        style={{
          ...this.styles.baseIcon,
          color: selected ? 'white' : 'black',
          backgroundColor: selected ? '#F44336' : '#EEEEEE'
        }}
        onClick={() => this.setState({grouping: grouping})}
      >
        {iconName}
      </FontIcon>
    );
  }


  renderHoveredCard(card) {
    return (
      <Card
        id={card.id}
        name={card.name}
        spriteID={card.spriteID}
        spriteV={card.spriteV}
        type={card.type}
        text={splitSentences(card.text).map(Sentence)}
        rawText={card.text || ''}
        stats={card.stats}
        cardStats={card.stats}
        cost={card.cost}
        baseCost={card.cost}
        source={card.source} />
    );
  }

  renderCard(card, idx, type) {
    return (
      <div key={idx}>
        <Popover
          isOpen={this.state.hoveredRow === idx && this.state.hoveredSection === type}
          place="below"
          style={this.styles.popover}
          enterExitTransitionDurationMs={5}
          tipSize={0.01}
          body={this.renderHoveredCard(card)}>
          <div
            style={this.styles.outerCard}     
            onClick={() => this.props.onCardClick(card.id)}
            onMouseOver={() => this.setState({hoveredRow: idx, hoveredSection: type})}
            onMouseOut={() => this.setState({hoveredRow: null, hoveredSection: null})}>
            <div style={this.styles.cardCost}>{card.cost}</div>
            <div style={this.styles.cardName}>{card.name}</div>
            <div style={this.styles.cardCount}>{card.count > 1 ? card.count : ''}</div>
          </div>
        </Popover>
      </div>
    );
  }

  renderCardList() {
    if (this.state.grouping === 0) {
      return (
        <div>
          {sortBy(groupCards(this.props.cards), ['cost', 'name']).map((card, idx) =>
            this.renderCard(card, idx)
          )}
        </div>
      );
    } else {
      return (
        <div>
          <div style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 10
          }}>Robots</div>

          {sortBy(groupCards(selectType(this.props.cards, 0)), ['cost', 'name']).map((card, idx) =>
            this.renderCard(card, idx, 0)
          )}

          <div style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 10,
            marginTop: 10
          }}>Events</div>

          {sortBy(groupCards(selectType(this.props.cards, 1)), ['cost', 'name']).map((card, idx) =>
            this.renderCard(card, idx, 1)
          )}

          <div style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 10,
            marginTop: 10
          }}>Structures</div>

          {sortBy(groupCards(selectType(this.props.cards, 3)), ['cost', 'name']).map((card, idx) =>
            this.renderCard(card, idx, 3)
          )}
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        <div style={{
          fontWeight: 100,
          fontSize: 28
        }}>
          Deck [
          <span style={{color: (this.props.cards.length === 30) ? 'green' : 'red'}}>
            &nbsp;{this.props.cards.length}&nbsp;
          </span>
          / 30 ]
        </div>

        <TextField
          value={this.state.name}
          floatingLabelText="Deck Name"
          style={{width: '100%', marginBottom: 10}}
          onChange={e => { this.setState({name: e.target.value}); }} />

        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 20
          }}>
            {this.renderButton(0, 'format_list_numbered')}
            {this.renderButton(1, 'format_align_left')}
          </div>
        </div>

        {this.renderCardList()}

        <MustBeLoggedIn loggedIn={this.props.loggedIn}>
          <RaisedButton
            label="Save Deck"
            labelPosition="before"
            secondary
            disabled={!this.state.name}
            icon={<FontIcon className="material-icons">save</FontIcon>}
            style={{width: '100%', marginTop: 20}}
            onClick={() => { this.props.onSaveDeck(this.props.id, this.state.name, this.props.cards.map(c => c.id)); }}
          />
        </MustBeLoggedIn>
      </div>
    );
  }
}
