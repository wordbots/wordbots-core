import Paper from '@material-ui/core/Paper';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { compact, find, noop } from 'lodash';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { AnyAction, compose, Dispatch } from 'redux';

import * as collectionActions from '../actions/collection';
import Background from '../components/Background';
import ActiveDeck from '../components/cards/ActiveDeck';
import CardCollection from '../components/cards/CardCollection';
import DeckCreationSidebarControls from '../components/cards/DeckCreationSidebarControls';
import EnergyCurve from '../components/cards/EnergyCurve';
import { DeckCreationProperties, FilterKey } from '../components/cards/types';
import { Layout, SortCriteria, SortOrder } from '../components/cards/types.enums';
import * as w from '../types';
import { getDisplayedCards } from '../util/cards';

interface DeckStateProps {
  id: string | null
  cards: w.CardInStore[]
  deck: w.DeckInStore | null
  decks: w.DeckInStore[]
  sets: w.Set[]
  loggedIn: boolean
}

interface DeckDispatchProps {
  editDeck: (deckId: w.DeckId) => void
  onSaveDeck: (id: w.DeckId | null, name: string, cardIds: string[], setId: string | null) => void
}

type DeckProps = DeckStateProps & DeckDispatchProps & RouteComponentProps & WithStyles;

type DeckState = DeckCreationProperties & {
  setId: string | null
};

function mapStateToProps(state: w.State): DeckStateProps {
  const { collection: { deckBeingEdited: deck, cards, decks, sets }, global: { user } } = state;

  return {
    id: deck ? deck.id : null,
    cards,
    deck,
    decks,
    sets,
    loggedIn: user !== null
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>): DeckDispatchProps {
  return {
    editDeck: (deckId: w.DeckId) => {
      dispatch(collectionActions.editDeck(deckId));
    },
    onSaveDeck: (id: w.DeckId | null, name: string, cardIds: string[], setId: string | null) => {
      dispatch(collectionActions.saveDeck(id, name, cardIds, setId));
    }
  };
}

export class Deck extends React.Component<DeckProps, DeckState> {
  // Note that these styles are also used by the Set container.
  public static styles: Record<string, CSSProperties> = {
    container: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    leftSidebar: { margin: '30px 10px 50px 25px', width: 240, minWidth: 240 },
    energyCurvePaper: { padding: 10, paddingTop: 10, marginBottom: 20 },
    energyCurveHeading: { paddingLeft: 10, fontWeight: 100, fontSize: 28 },
    cards: { marginTop: 10, width: '100%' },
    rightSidebar: { margin: '30px 20px 50px 10px', width: 240, minWidth: 240 },
    deckPropsPaper: { padding: '15px 15px 15px 20px' }
  };

  constructor(props: DeckProps) {
    super(props);

    this.state = {
      filters: {
        robots: true,
        events: true,
        structures: true
      },
      costRange: [0, 20],
      sortCriteria: SortCriteria.Timestamp,
      sortOrder: SortOrder.Ascending,
      searchText: '',
      selectedCardIds: props.deck?.cardIds || [],
      layout: Layout.Grid,
      setId: null
    };
  }

  get set(): w.Set | undefined {
    const { sets } = this.props;
    const { setId } = this.state;

    if (setId) {
      return sets.find((s) => s.id === setId);
    }
  }

  get cardPool(): w.CardInStore[] {
    return this.set ? this.set.cards : this.props.cards;
  }

  get selectedCards(): w.CardInStore[] {
    return compact(this.state.selectedCardIds.map((id) => find(this.cardPool, { id })));
  }

  get displayedCards(): w.CardInStore[] {
    const { searchText, filters, costRange, sortCriteria, sortOrder } = this.state;
    return getDisplayedCards(this.cardPool, { searchText, filters, costRange, sortCriteria, sortOrder });
  }

  public componentDidMount(): void {
    this.maybeLoadDeck();
  }

  public render(): JSX.Element {
    const { id, deck, loggedIn, classes } = this.props;

    return (
      <div>
        <Helmet title="Building Deck"/>
        <Background asset="compressed/Conveyor 03.jpg" opacity={0.45} />

        <div className={classes.container}>
          <div className={classes.leftSidebar}>
            <Paper className={classes.energyCurvePaper}>
              <div className={classes.energyCurveHeading}>Energy Curve</div>
              <EnergyCurve cards={this.selectedCards} />
            </Paper>

            <DeckCreationSidebarControls
              layout={this.state.layout}
              sortCriteria={this.state.sortCriteria}
              sortOrder={this.state.sortOrder}
              onSetField={this.setField}
              onToggleFilter={this.toggleFilter}
            />
          </div>

          <div className={classes.cards}>
            <CardCollection
              allowMultipleSelection
              layout={this.state.layout}
              cards={this.displayedCards}
              selectedCardIds={this.state.selectedCardIds}
              onSelection={this.handleSelectCards}
            />
          </div>

          <div className={classes.rightSidebar}>
            <Paper className={classes.deckPropsPaper}>
              <ActiveDeck
                id={id}
                name={deck ? deck.name : ''}
                cards={this.selectedCards}
                deck={deck || undefined}
                setForDeck={this.set}
                loggedIn={loggedIn}
                onIncreaseCardCount={this.handleClickIncreaseCardCount}
                onDecreaseCardCount={this.handleClickDecreaseCardCount}
                onRemoveCard={this.handleRemoveCard}
                onSave={this.handleClickSaveDeck}
              />
            </Paper>
          </div>
        </div>
      </div>
    );
  }

  /** If there is a deckId in the URL, try to load the desired deck. */
  private maybeLoadDeck = async () => {
    const { decks, history, match, editDeck } = this.props;
    const { pathname } = history.location;

    // check for /deck/for/set/[setId] URL first
    if (pathname.startsWith('/deck/for/set/')) {
      const setId = pathname.split('for/set/')[1];
      this.setState({ setId });
    } else if (match) {
      // then check for /deck/[deckId] URL
      const { deckId } = (match ? match.params : {}) as Record<string, string | undefined>;
      if (deckId && deckId !== 'new') {
        const deck: w.DeckInStore | undefined = find(decks, { id: deckId });
        if (deck) {
          editDeck(deckId);
          this.setState({ selectedCardIds: deck.cardIds });
        } else {
          // If deck not found, redirect to the new deck URL.
          history.replace('/deck/new');
        }
      }
    }
  }

  private setField = (key: keyof DeckState, callback = noop) => (value: any) => {
    this.setState({[key]: value} as any, callback);
  }

  private toggleFilter = (filter: FilterKey) => (_e: React.SyntheticEvent<any>, toggled: boolean) => {
    this.setState((state) => ({
      filters: {...state.filters, [filter]: toggled}
    }));
  }

  private handleSelectCards = (selectedCardIds: string[]) => {
    this.setState({ selectedCardIds });
  }

  private handleClickSaveDeck = (id: string | null, name: string, cardIds: w.CardId[]) => {
    this.props.onSaveDeck(id, name, cardIds, this.state.setId);
    this.props.history.push('/decks');
  }

  private handleClickIncreaseCardCount = (id: w.CardId) => {
    this.setState((state) => {
      state.selectedCardIds.push(id);
      return state;
    });
  }

  private handleClickDecreaseCardCount = (id: w.CardId) => {
    this.setState((state) => {
      state.selectedCardIds.splice(state.selectedCardIds.indexOf(id), 1);
      return state;
    });
  }

  private handleRemoveCard = (id: w.CardId) => {
    this.setState((state) => ({
      selectedCardIds: state.selectedCardIds.filter((cardId) => cardId !== id)
    }));
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(Deck.styles)
)(Deck);
