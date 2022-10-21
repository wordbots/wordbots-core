import Paper from '@material-ui/core/Paper';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import * as fb from 'firebase';
import { compact, find, identity, noop, pickBy, uniqBy } from 'lodash';
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
import { getDisplayedCards } from '../components/cards/utils';
import * as w from '../types';
import { id as generateId } from '../util/common';

import { Deck } from './Deck';

interface SetStateProps {
  id: string | null
  setBeingEdited: w.Set | null
  sets: w.Set[]
  allCards: w.CardInStore[]
  user: fb.User | null
}

interface SetDispatchProps {
  editSet: (setId: w.SetId) => void
  onSaveSet: (set: w.Set) => void
}

type SetProps = SetStateProps & SetDispatchProps & RouteComponentProps & WithStyles;
type SetState = DeckCreationProperties & { cardRarities: Record<w.CardId, w.CardInSetRarity | undefined> };

function mapStateToProps(state: w.State): SetStateProps {
  return {
    id: state.collection.setBeingEdited ? state.collection.setBeingEdited.id : null,
    setBeingEdited: state.collection.setBeingEdited,
    sets: state.collection.sets,
    allCards: uniqBy([...state.collection.cards, ...(state.collection.setBeingEdited?.cards || [])], 'id'),
    user: state.global.user
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>): SetDispatchProps {
  return {
    editSet: (setId: w.SetId) => {
      dispatch(collectionActions.editSet(setId));
    },
    onSaveSet: (set: w.Set) => {
      dispatch(collectionActions.saveSet(set));
    }
  };
}

/**
 * Container encapsulating display and logic for creating and editing Sets.
 * @TODO Reduce duplication between Set and Deck containers.
 */
class Set extends React.Component<SetProps, SetState> {
  constructor(props: SetProps) {
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
      selectedCardIds: props.setBeingEdited ? props.setBeingEdited.cards.map((c) => c.id) : [],
      cardRarities: props.setBeingEdited ? Object.fromEntries(props.setBeingEdited.cards.map((c) => [c.id, c.rarity])) : {},
      layout: Layout.Grid
    };
  }

  get selectedCards(): w.CardInStore[] {
    return compact(this.state.selectedCardIds.map((id) => find(this.props.allCards, { id })));
  }

  get displayedCards(): w.CardInStore[] {
    const { searchText, filters, costRange, sortCriteria, sortOrder } = this.state;
    return getDisplayedCards(this.props.allCards, { searchText, filters, costRange, sortCriteria, sortOrder });
  }

  get hasRaritiesEnabled(): boolean {
    return Object.values(this.state.cardRarities).some(identity);
  }

  public componentDidMount(): void {
    this.maybeLoadSet();
  }

  public render(): JSX.Element {
    const { setBeingEdited, user, classes } = this.props;
    const { layout, selectedCardIds, cardRarities, sortCriteria, sortOrder } = this.state;

    return (
      <div>
        <Helmet title={setBeingEdited ? 'Editing Set' : 'Creating Set'} />
        <Background asset="compressed/Conveyor 03.jpg" opacity={0.45} />

        <div className={classes.container}>
          <div className={classes.leftSidebar}>
            <Paper className={classes.energyCurvePaper}>
              <div className={classes.energyCurveHeading}>Energy Curve</div>
              <EnergyCurve cards={this.selectedCards} height={130} />
            </Paper>

            <DeckCreationSidebarControls
              layout={layout}
              sortCriteria={sortCriteria}
              sortOrder={sortOrder}
              onSetField={this.setField}
              onToggleFilter={this.toggleFilter}
            />
          </div>

          <div className={classes.cards}>
            <CardCollection
              layout={layout}
              cards={this.displayedCards}
              selectedCardIds={selectedCardIds}
              onSelection={this.handleSelectCards}
            />
          </div>

          <div className={classes.rightSidebar}>
            <Paper className={classes.deckPropsPaper}>
              <ActiveDeck
                isASet
                id={setBeingEdited ? setBeingEdited.id : ''}
                name={setBeingEdited ? setBeingEdited.name : ''}
                description={setBeingEdited ? setBeingEdited.description : ''}
                cards={this.selectedCards}
                cardRarities={cardRarities}
                loggedIn={!!user}
                onRemoveCard={this.handleRemoveCard}
                onUpdateCardRarities={this.handleUpdateCardRarities}
                onSave={this.handleClickSaveSet}
              />
            </Paper>
          </div>
        </div>
      </div>
    );
  }

  /** If there is a setId in the URL, try to load the desired set. */
  private maybeLoadSet = async () => {
    const { sets, editSet, history, match } = this.props;

    if (match) {
      // check for /set/[setId] URL
      const { setId } = (match ? match.params : {}) as Record<string, string | undefined>;
      if (setId && setId !== 'new') {
        const set: w.Set | undefined = find(sets, { id: setId });
        if (set) {
          editSet(setId);
          this.setState({
            selectedCardIds: set.cards.map((c) => c.id),
            cardRarities: Object.fromEntries(set.cards.map((c) => [c.id, c.rarity]))
          });
        } else {
          // If set not found, redirect to the new set URL.
          history.replace('/set/new');
        }
      }
    }
  }

  private setField = (key: keyof SetState, callback = noop) => (value: SetState[typeof key]) => {
    this.setState({ [key]: value } as Pick<SetState, keyof SetState>, callback);
  }

  private toggleFilter = (filter: FilterKey) => (_e: React.SyntheticEvent<HTMLInputElement>, toggled: boolean) => {
    this.setState((state) => ({
      filters: { ...state.filters, [filter]: toggled }
    }));
  }

  private handleSelectCards = (selectedCardIds: string[]) => {
    this.setState((state) => ({
      selectedCardIds,
      cardRarities: {
        // concatenate existing card rarities (only for those cards in selectedCardIds) ...
        ...pickBy(state.cardRarities, (_, cardId) => selectedCardIds.includes(cardId)),
        // ... with new default rarities (either 'common' or undefined) for newly selected cards
        ...Object.fromEntries(
          selectedCardIds
            .filter((cardId) => !Object.keys(state.cardRarities).includes(cardId))
            .map((cardId) => [cardId, this.hasRaritiesEnabled ? 'common' : undefined])
        )
      }
    }));
  }

  private handleUpdateCardRarities = (updatedCardRarities: Record<w.CardId, w.CardInSetRarity | undefined>) => {
    this.setState((state) => ({
      cardRarities: { ...state.cardRarities, ...updatedCardRarities }
    }));
  }

  private handleRemoveCard = (id: string) => {
    this.setState((state) => ({
      selectedCardIds: state.selectedCardIds.filter((cardId) => cardId !== id),
      cardRarities: pickBy(state.cardRarities, (_, cardId) => cardId !== id)
    }));
  }

  private handleClickSaveSet = (id: string | null, name: string, cardIds: string[], description?: string) => {
    const { allCards, user, onSaveSet, history } = this.props;
    const { cardRarities } = this.state;

    if (!user) {
      return;
    }

    const set: w.Set = {
      id: id || generateId(),
      name,
      description,
      cards: (
        allCards
          .filter((card) => cardIds.includes(card.id))
          .map((card) => ({ ...card, rarity: cardRarities[card.id] }))
      ),
      metadata: {
        authorId: user.uid,
        authorName: user.displayName || user.uid,
        isPublished: false,
        lastModified: Date.now()
      }
    };

    onSaveSet(set);
    history.push('/sets');
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(Deck.styles)
)(Set);
