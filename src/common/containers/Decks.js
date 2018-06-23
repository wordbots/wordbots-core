import * as React from 'react';
import { arrayOf, bool, func, object } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';

import { cardsInDeck } from '../util/cards';
import DeckSummary from '../components/cards/DeckSummary';
import MustBeLoggedIn from '../components/users/MustBeLoggedIn';
import * as collectionActions from '../actions/collection';

import Play from './Play';

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

class Decks extends React.Component {
  static propTypes = {
    cards: arrayOf(object),
    decks: arrayOf(object),
    loggedIn: bool,

    history: object,

    onCreateDeck: func,
    onDeleteDeck: func,
    onDuplicateDeck: func,
    onEditDeck: func
  };

  handleCreateDeck = () => {
    this.props.onCreateDeck();
    this.props.history.push('/deck');
  };

  handleEditDeck = (deckId) => {
    this.props.onEditDeck(deckId);
    this.props.history.push('/deck');
  };

  handleTryDeck = (deck) => {
    const { history } = this.props;
    history.push(Play.urlForGameMode('practice', deck), { previous: history.location });
  }

  render = () => (
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
              onClick={this.handleCreateDeck} />
          </MustBeLoggedIn>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            width: '100%',
            margin: 10
          }}>
            {
              this.props.decks.map((deck, idx) =>
                <DeckSummary
                  key={idx}
                  deck={deck}
                  cards={cardsInDeck(deck, this.props.cards)}
                  loggedIn={this.props.loggedIn}
                  onDelete={this.props.onDeleteDeck}
                  onDuplicate={this.props.onDuplicateDeck}
                  onEdit={this.handleEditDeck}
                  onTry={this.handleTryDeck} />
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Decks));
