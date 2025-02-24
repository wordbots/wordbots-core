import { History } from 'history';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { AnyAction, compose, Dispatch } from 'redux';

import * as collectionActions from '../actions/collection';
import Background from '../components/Background';
import DeckSummary from '../components/cards/DeckSummary';
import Title from '../components/Title';
import ToolbarButton from '../components/ToolbarButton';
import MustBeLoggedIn from '../components/users/MustBeLoggedIn';
import * as w from '../types';
import { cardsInDeck, sortDecks } from '../util/decks';

import { urlForGameMode } from './Play';

interface DecksStateProps {
  cards: w.CardInStore[]
  decks: w.DeckInStore[]
  sets: w.Set[]
  loggedIn: boolean
}

interface DecksDispatchProps {
  onCreateDeck: () => void
  onDeleteDeck: (deckId: string) => void
  onDuplicateDeck: (deckId: string) => void
  onEditDeck: (deckId: string) => void
}

type DecksProps = DecksStateProps & DecksDispatchProps & { history: History };

function mapStateToProps(state: w.State): DecksStateProps {
  return {
    cards: state.collection.cards,
    decks: state.collection.decks,
    sets: state.collection.sets,
    loggedIn: state.global.user !== null
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>): DecksDispatchProps {
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

class Decks extends React.Component<DecksProps> {
  public render(): JSX.Element {
    const { decks, cards, sets, loggedIn, onDeleteDeck, onDuplicateDeck } = this.props;
    return (
      <div>
        <Helmet title="Decks" />
        <Background asset="compressed/Conveyor 03.jpg" opacity={0.45} />

        <Title text="Decks" />

        <div style={{ display: 'inline', paddingLeft: 10 }}>
          <MustBeLoggedIn loggedIn={loggedIn} style={{ display: 'inline-block' }}>
            <ToolbarButton
              icon="add_circle_outline"
              tooltip={loggedIn ? "Create a new deck using cards in your collection." : undefined}
              onClick={this.handleCreateDeck}
            >
              New Deck
            </ToolbarButton>
          </MustBeLoggedIn>
        </div>


        <div style={{ margin: 20 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              width: '100%'
            }}
          >
            {
              sortDecks(decks).map((deck, idx) =>
                <DeckSummary
                  key={idx}
                  deck={deck}
                  cards={cardsInDeck(deck, cards, sets)}
                  set={sets.find((s) => s.id === deck.setId)}
                  loggedIn={loggedIn}
                  onDelete={onDeleteDeck}
                  onDuplicate={onDuplicateDeck}
                  onEdit={this.handleEditDeck}
                  onTry={this.handleTryDeck}
                />
              )
            }
          </div>
        </div>
      </div>
    );
  }

  private handleCreateDeck = () => {
    this.props.onCreateDeck();
    this.props.history.push('/deck/new');
  }

  private handleEditDeck = (deckId: string) => {
    this.props.onEditDeck(deckId);
    this.props.history.push(`/deck/${deckId}`);
  }

  private handleTryDeck = (deck: w.DeckInStore) => {
    const { history } = this.props;
    const tryDeckUrl = urlForGameMode('practice', 'normal', deck);
    history.push(tryDeckUrl, { previous: history.location });
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(Decks);
