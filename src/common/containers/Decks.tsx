import * as React from 'react';
import Helmet from 'react-helmet';
import { compose, Dispatch, AnyAction } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { History } from 'history';
import RaisedButton from 'material-ui/RaisedButton';

import * as w from '../types';
import { cardsInDeck } from '../util/cards';
import { sortDecks } from '../util/decks';
import Title from '../components/Title';
import DeckSummary from '../components/cards/DeckSummary';
import MustBeLoggedIn from '../components/users/MustBeLoggedIn';
import * as collectionActions from '../actions/collection';

import Singleplayer from './Singleplayer';

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
        <Title text="Decks" />

        <div style={{margin: 20}}>
          <MustBeLoggedIn loggedIn={loggedIn}>
            <RaisedButton
              label="New Deck"
              secondary
              style={{marginBottom: 20}}
              labelStyle={{fontFamily: 'Carter One'}}
              onClick={this.handleCreateDeck} />
          </MustBeLoggedIn>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            width: '100%'
          }}>
            {
              sortDecks(decks).map((deck, idx) =>
                <DeckSummary
                  key={idx}
                  deck={deck}
                  cards={cardsInDeck(deck, cards)}
                  set={sets.find((s) => s.id === deck.setId)}
                  loggedIn={loggedIn}
                  onDelete={onDeleteDeck}
                  onDuplicate={onDuplicateDeck}
                  onEdit={this.handleEditDeck}
                  onTry={this.handleTryDeck} />
              )
            }
          </div>
        </div>
      </div>
    );
  }

  private handleCreateDeck = () => {
    this.props.onCreateDeck();
    this.props.history.push('/deck');
  }

  private handleEditDeck = (deckId: string) => {
    this.props.onEditDeck(deckId);
    this.props.history.push('/deck');
  }

  private handleTryDeck = (deck: w.DeckInStore) => {
    const { history } = this.props;
    history.push((Singleplayer as any).urlForGameMode('practice', deck), { previous: history.location });
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(Decks);
