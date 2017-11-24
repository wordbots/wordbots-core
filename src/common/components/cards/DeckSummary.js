import React, { Component } from 'react';
import { arrayOf, bool, func, object } from 'prop-types';
import Badge from 'material-ui/Badge';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import { filter, sortBy } from 'lodash';

import { TYPE_ROBOT, TYPE_EVENT, TYPE_STRUCTURE } from '../../constants';
import { groupCards } from '../../util/cards';
import CardTooltip from '../card/CardTooltip';
import MustBeLoggedIn from '../users/MustBeLoggedIn';

export default class DeckSummary extends Component {
  static propTypes = {
    cards: arrayOf(object),
    deck: object,
    loggedIn: bool,

    onDelete: func,
    onDuplicate: func,
    onEdit: func
  };

  get styles() {
    return {
      cardItem: {
        display: 'flex',
        alignItems: 'stretch'
      },
      cardBadgeStyle: {
        backgroundColor: '#00bcd4',
        fontFamily: 'Carter One',
        color: 'white',
        marginRight: 10
      },
      cardBadge: {
        padding: 0,
        width: 24,
        height: 24
      },
      cardName: {
        display: 'flex',
        alignItems: 'center',
        width: 'calc(100% - 24px)'
      },
      cardCount: {
        width: 20,
        display: 'flex',
        alignItems: 'center',
        fontWeight: 'bold'
      }
    };
  }

  handleClickDelete = () => {
    this.props.onDelete(this.props.deck.id);
  }

  handleClickDuplicate = () => {
    this.props.onDuplicate(this.props.deck.id);
  }

  handleClickEdit = () => {
    this.props.onEdit(this.props.deck.id);
  }

  renderCard(card, idx) {
    return (
      <div
        key={idx}
        style={{
          backgroundColor: '#FFFFFF',
          marginBottom: 7,
          height: 24,
          minWidth: 200
      }}>
        <CardTooltip card={card}>
          <div style={this.styles.cardItem}>
            <Badge
              badgeContent={card.cost}
              badgeStyle={this.styles.cardBadgeStyle}
              style={this.styles.cardBadge} />
            <div style={this.styles.cardName}>{card.name}</div>
            <div style={this.styles.cardCount}>{card.count > 1 ? `${card.count}x` : ''}</div>
          </div>
        </CardTooltip>
      </div>
    );
  }

  renderCards(cards) {
    return sortBy(groupCards(cards), ['cost', 'name']).map(this.renderCard.bind(this));
  }

  render() {
    const { cards, deck } = this.props;
    const [robots, structures, events] = [TYPE_ROBOT, TYPE_STRUCTURE, TYPE_EVENT].map(t => filter(cards, ['type', t]));
    const isComplete = (cards.length === 30);

    return (
      <Paper
        key={deck.name}
        style={{marginRight: 20, marginBottom: 20, padding: 10}}
      >
        <div style={{display: 'flex', marginBottom: 15}}>
          <div style={{flex: 1, fontSize: 32, fontWeight: 100}}>
            {deck.name}
          </div>

          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            textAlign: 'right',
            fontSize: 24,
            color: (isComplete ? 'green' : 'red')}}>
            <FontIcon
              className="material-icons"
              style={{paddingRight: 5, color: (isComplete ? 'green' : 'red')}}
            >
              {isComplete ? 'done' : 'warning'}
            </FontIcon>
            {cards.length} cards
          </div>
        </div>

        <div>
          <MustBeLoggedIn loggedIn={this.props.loggedIn}>
            <RaisedButton
              primary
              label="Edit"
              disabled={deck.id.startsWith('[default-')}
              onClick={this.handleClickEdit}
              style={{float: 'left', marginRight: 10, width: '31%'}} />
            <RaisedButton
              primary
              label="Duplicate"
              onClick={this.handleClickDuplicate}
              style={{float: 'left', marginRight: 10, width: '31%'}} />
            <RaisedButton
              primary
              label="Delete"
              disabled={deck.id.startsWith('[default-')}
              onClick={this.handleClickDelete}
              style={{float: 'left', width: '31%'}}/>
          </MustBeLoggedIn>
        </div>

        <div style={{padding: '0 10px 10px 10px'}}>
          <div style={{float: 'left', marginRight: 30}}>
            <h4 style={{
              margin: '20px 0 20px -10px'
            }}>Robots ({robots.length})</h4>
            {this.renderCards(robots)}
          </div>

          <div style={{float: 'left'}}>
            <h4 style={{
              margin: '20px 0 20px -10px'
            }}>Structures ({structures.length})</h4>
            {this.renderCards(structures)}

            <h4 style={{
              margin: '20px 0 20px -10px'
            }}>Events ({events.length})</h4>
            {this.renderCards(events)}
          </div>
        </div>
      </Paper>
    );
  }
}
