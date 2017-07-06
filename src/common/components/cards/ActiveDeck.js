import React, { Component } from 'react';
import { array, bool, func, string } from 'prop-types';
import FontIcon from 'material-ui/FontIcon';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { sortBy } from 'lodash';

import { groupCards, selectType, splitSentences } from '../../util/cards';
import MustBeLoggedIn from '../users/MustBeLoggedIn';
import Card from '../card/Card';
import Sentence from '../card/Sentence';
import Tooltip from '../Tooltip';

import CardTooltip from './CardTooltip';

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
      grouping: 0
    };
  }

  get styles() {
    return {
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
        width: '100%',
        boxSizing: 'border-box',
        textAlign: 'center'
      }
    };
  }

  renderButton(grouping, iconName, tooltip) {
    const selected = (this.state.grouping === grouping);

    return (
      <div style={{width: '47.5%'}}>
        <Tooltip text={tooltip} place="top" style={{zIndex: 99999}}>
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
        </Tooltip>
      </div>
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
        <CardTooltip card={this.renderHoveredCard(card)}>
          <div
            style={this.styles.outerCard}
            onClick={() => this.props.onCardClick(card.id)}>
            <div style={this.styles.cardCost}>{card.cost}</div>
            <div style={this.styles.cardName}>{card.name}</div>
            <div style={this.styles.cardCount}>{card.count > 1 ? card.count : ''}</div>
          </div>
        </CardTooltip>
      </div>
    );
  }

  renderCardGroup(type) {
    return (
      <div>
        {sortBy(groupCards(selectType(this.props.cards, type)), ['cost', 'name']).map((card, idx) =>
          this.renderCard(card, idx, type)
        )}
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

          {this.renderCardGroup(0)}

          <div style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 10,
            marginTop: 10
          }}>Events</div>

          {this.renderCardGroup(1)}

          <div style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 10,
            marginTop: 10
          }}>Structures</div>

          {this.renderCardGroup(3)}
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
            {this.renderButton(0, 'view_headline', 'Group by Cost')}
            {this.renderButton(1, 'view_agenda', 'Group by Type')}
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
