import React, { Component } from 'react';
import { array, bool, func, object } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Badge from 'material-ui/Badge';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import { filter, sortBy } from 'lodash';

import { TYPE_ROBOT, TYPE_EVENT, TYPE_STRUCTURE } from '../constants';
import { cardsInDeck, groupCards } from '../util/cards';
import CardTooltip from '../components/card/CardTooltip';
import MustBeLoggedIn from '../components/users/MustBeLoggedIn';
import * as collectionActions from '../actions/collection';

function mapStateToProps(state) {
  return {
    cards: state.collection.cards,
    decks: state.collection.decks,
    loggedIn: state.global.user !== null
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onCreateDeck: () => {
      dispatch(collectionActions.editDeck(null));
    },
    onDeleteDeck: (deckId) => {
      dispatch(collectionActions.deleteDeck(deckId));
    },
    onDuplicateDeck: (deckId) => {
      dispatch(collectionActions.duplicateDeck(deckId));
    },
    onEditDeck: (deckId) => {
      dispatch(collectionActions.editDeck(deckId));
    }
  };
}

class Decks extends Component {
  static propTypes = {
    cards: array,
    decks: array,
    loggedIn: bool,

    history: object,

    onCreateDeck: func,
    onDeleteDeck: func,
    onDuplicateDeck: func,
    onEditDeck: func
  };

  constructor(props) {
    super(props);
  }

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

  renderDeck(deck) {
    const cards = cardsInDeck(deck, this.props.cards);
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
              label="Edit"
              primary
              onClick={() => {
                this.props.onEditDeck(deck.id);
                this.props.history.push('/deck');
              }}
              style={{float: 'left', marginRight: 10, width: '31%'}} />
            <RaisedButton
              label="Duplicate"
              primary
              onClick={() => { this.props.onDuplicateDeck(deck.id); }}
              style={{float: 'left', marginRight: 10, width: '31%'}} />
            <RaisedButton
              label="Delete"
              disabled={deck.id === '[default]'}
              onClick={e => { this.props.onDeleteDeck(deck.id); }}
              primary
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

  render() {
    return (
      <div>
        <Helmet title="Decks" />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{marginTop: 50, marginLeft: 40}}>
            <MustBeLoggedIn loggedIn={this.props.loggedIn}>
              <RaisedButton
                label="New Deck"
                secondary
                style={{margin: 10}}
                labelStyle={{fontFamily: 'Carter One'}}
                onClick={() => {
                  this.props.onCreateDeck();
                  this.props.history.push('/deck');
                }} />
            </MustBeLoggedIn>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              width: '100%',
              margin: 10
            }}>
              {this.props.decks.map(this.renderDeck.bind(this))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Decks));
