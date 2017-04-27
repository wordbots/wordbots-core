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
import CardViewer from '../components/card/CardViewer';
import MustBeLoggedIn from '../components/users/MustBeLoggedIn';
import * as collectionActions from '../actions/collection';

function mapStateToProps(state) {
  return {
    cards: state.collection.cards,
    decks: state.collection.decks,
    loggedIn: state.global.user !== null,
    sidebarOpen: state.global.sidebarOpen
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
    sidebarOpen: bool,

    history: object,

    onCreateDeck: func,
    onDeleteDeck: func,
    onEditDeck: func
  };

  constructor(props) {
    super(props);

    this.state = {
      hoveredCard: null
    };
  }

  onHover(card) {
    this.setState({hoveredCard: {card: card, stats: card.stats}});
  }

  renderCard(card, idx) {
    const isHovered = this.state.hoveredCard && this.state.hoveredCard.card.id === card.id;

    return (
      <div
        key={idx}
        onMouseOver={e => this.onHover(card)}
        style={{
          backgroundColor: isHovered ? '#eee' : '#fff',
          marginBottom: 7,
          display: 'flex',
          alignItems: 'stretch',
          height: 24,
          minWidth: 200
      }}>
        <Badge
          badgeContent={card.cost}
          badgeStyle={{backgroundColor: '#00bcd4', fontFamily: 'Carter One', color: 'white', marginRight: 10}}
          style={{padding: 0, width: 24, height: 24 }} />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          width: 'calc(100% - 24px)'
        }}>{card.name}</div>
        <div style={{
          width: 20,
          display: 'flex',
          alignItems: 'center',
          fontWeight: 'bold'
        }}>{card.count > 1 ? `${card.count}x` : ''}</div>
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

          <div style={{flex: 1, textAlign: 'right', fontSize: 24, color: (isComplete ? 'green' : 'red')}}>
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
              style={{float: 'left', marginRight: 10, width: '45%'}} />
            <RaisedButton
              label="Delete"
              disabled={deck.id === '[default]'}
              onClick={e => { this.props.onDeleteDeck(deck.id); }}
              primary
              style={{float: 'left', width: '45%'}}/>
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
      <div style={{height: '100%', paddingLeft: this.props.sidebarOpen ? 256 : 0}}>
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

          <div style={{
            margin: 50,
            marginLeft: 0,
            width: 220,
            height: 300,
            position: 'relative'
          }}>
            <CardViewer hoveredCard={this.state.hoveredCard} />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Decks));
