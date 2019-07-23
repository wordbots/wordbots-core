import Paper from '@material-ui/core/Paper';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { History } from 'history';
import { compact, find, noop } from 'lodash';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { AnyAction, compose, Dispatch } from 'redux';

import * as collectionActions from '../actions/collection';
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
  sets: w.Set[]
  loggedIn: boolean
}

interface DeckDispatchProps {
  onSaveDeck: (id: string | null, name: string, cardIds: string[], setId: string | null) => void
}

type DeckProps = DeckStateProps & DeckDispatchProps & { history: History } & WithStyles;

type DeckState = DeckCreationProperties & {
  setId: string | null
};

function mapStateToProps(state: w.State): DeckStateProps {
  const { collection: { deckBeingEdited: deck, cards, sets }, global: { user } } = state;

  return {
    id: deck ? deck.id : null,
    cards,
    deck,
    sets,
    loggedIn: user !== null
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>): DeckDispatchProps {
  return {
    onSaveDeck: (id: string | null, name: string, cardIds: string[], setId: string | null) => {
      dispatch(collectionActions.saveDeck(id, name, cardIds, setId));
    }
  };
}

export class Deck extends React.Component<DeckProps, DeckState> {
  public static styles: Record<string, CSSProperties> = {
    container: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    leftSidebar: { margin: '30px 10px 50px 30px', width: 300, minWidth: 300 },
    energyCurvePaper: { padding: 20, marginBottom: 20 },
    energyCurveHeading: { fontWeight: 100, fontSize: 28 },
    cards: { marginTop: 10, width: '100%' },
    rightSidebar: { margin: '30px 30px 50px 10px', width: 300, minWidth: 300 },
    deckPropsPaper: { padding: 20 }
  };

  constructor(props: DeckProps) {
    super(props);

    const { deck, history: { location: { pathname } } } = this.props;

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
      selectedCardIds: deck ? deck.cardIds : [],
      layout: Layout.Grid,
      setId: pathname.startsWith('/deck/for/set/') ? pathname.split('for/set/')[1] : (deck && deck.setId)
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

  public render(): JSX.Element {
    const { id, deck, loggedIn, classes } = this.props;

    return (
      <div>
        <Helmet title="Building Deck"/>

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
