import * as React from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { withRouter } from 'react-router';
import { History } from 'history';
import * as fb from 'firebase';
import Paper from '@material-ui/core/Paper';
import { compact, find, noop } from 'lodash';

import * as w from '../../common/types';
import { id as generateId } from '../util/common';
import { getDisplayedCards } from '../util/cards';
import ActiveDeck from '../components/cards/ActiveDeck';
import CardCollection from '../components/cards/CardCollection';
import EnergyCurve from '../components/cards/EnergyCurve';
import FilterControls from '../components/cards/FilterControls';
import LayoutControls from '../components/cards/LayoutControls';
import SearchControls from '../components/cards/SearchControls';
import SortControls from '../components/cards/SortControls';
import * as collectionActions from '../actions/collection';

interface NewSetStateProps {
  setBeingEdited: w.Set | null
  allCards: w.CardInStore[]
  user: fb.User | null
}

interface NewSetDispatchProps {
  onSaveSet: (set: w.Set) => void
}

type NewSetProps = NewSetStateProps & NewSetDispatchProps & { history: History };

interface NewSetState {
  filters: {
    robots: boolean
    events: boolean
    structures: boolean
  }
  costRange: [number, number]
  sortCriteria: 0 | 1 | 2 | 3 | 4 | 5 | 6
  sortOrder: 0 | 1
  searchText: string
  selectedCardIds: string[]
  layout: 0 | 1
}

function mapStateToProps(state: w.State): NewSetStateProps {
  return {
    setBeingEdited: state.collection.setBeingEdited,
    allCards: state.collection.cards,
    user: state.global.user
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>): NewSetDispatchProps {
  return {
    onSaveSet: (set: w.Set) => {
      dispatch(collectionActions.saveSet(set));
    }
  };
}

/**
 * Container encapsulating display and logic for creating and editing Sets.
 * @TODO Reduce duplication between NewSet and Deck containers.
 */
class NewSet extends React.Component<NewSetProps, NewSetState> {
  public state: NewSetState = {
    filters: {
      robots: true,
      events: true,
      structures: true
    },
    costRange: [0, 20],
    sortCriteria: 3,
    sortOrder: 0,
    searchText: '',
    selectedCardIds: [],
    layout: 0
  };

  constructor(props: NewSetProps) {
    super(props);

    if (props.setBeingEdited) {
      this.setState({ selectedCardIds: props.setBeingEdited.cards.map((c) => c.id) });
    }
  }

  get selectedCards(): w.CardInStore[] {
    return compact(this.state.selectedCardIds.map((id) => find(this.props.allCards, { id })));
  }

  get displayedCards(): w.CardInStore[] {
    const { searchText, filters, costRange, sortCriteria, sortOrder } = this.state;
    return getDisplayedCards(this.props.allCards, { searchText, filters, costRange, sortCriteria, sortOrder });
  }

  public render(): JSX.Element {
    const { setBeingEdited, user } = this.props;
    const { layout, selectedCardIds } = this.state;

    return (
      <div>
        <Helmet title={setBeingEdited ? "Editing Set" : "Creating Set"} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{
            margin: '30px 10px 50px 30px',
            width: 300,
            minWidth: 300
          }}>
            <Paper style={{padding: 20, marginBottom: 20}}>
              <div style={{fontWeight: 100, fontSize: 28}}>Energy Curve</div>
              <EnergyCurve cards={this.selectedCards} />
            </Paper>

            {this.renderSidebarControls()}
          </div>

          <div style={{marginTop: 10, width: '100%'}}>
            <CardCollection
              layout={layout}
              cards={this.displayedCards}
              selectedCardIds={selectedCardIds}
              onSelection={this.handleSelectCards} />
          </div>

          <div style={{
            margin: '30px 30px 50px 10px',
            width: 300,
            minWidth: 300
          }}>
            <Paper style={{padding: 20}}>
              <ActiveDeck
                isASet
                id={setBeingEdited ? setBeingEdited.id : ''}
                name={setBeingEdited ? setBeingEdited.name : ''}
                cards={this.selectedCards}
                loggedIn={!!user}
                onRemoveCard={this.handleRemoveCard}
                onSave={this.handleClickSaveSet} />
            </Paper>
          </div>
        </div>
      </div>
    );
  }

  private renderSidebarControls = (): JSX.Element => (
    <Paper style={{padding: 20, marginBottom: 10}}>
      <SearchControls onChange={this.set('searchText')} />

      <LayoutControls
        layout={this.state.layout}
        onSetLayout={this.set('layout')} />

      <SortControls
        criteria={this.state.sortCriteria}
        order={this.state.sortOrder}
        onSetCriteria={this.set('sortCriteria')}
        onSetOrder={this.set('sortOrder')} />

      <FilterControls
        onToggleFilter={this.toggleFilter}
        onSetCostRange={this.set('costRange')} />
    </Paper>
  )

  // this.set(key)(value) = this.setState({key: value})
  private set = (key: keyof NewSetState, callback = noop) => (value: any) => {
    this.setState({[key]: value} as any, callback);
  }

  private toggleFilter = (filter: 'robots' | 'events' | 'structures') => (_e: React.SyntheticEvent<any>, toggled: boolean) => {
    this.setState((state) => ({
      filters: Object.assign({}, state.filters, {[filter]: toggled})
    }));
  }

  private handleSelectCards = (selectedCardIds: string[]) => {
    this.setState({ selectedCardIds });
  }

  private handleRemoveCard = (id: string) => {
    this.setState((state) => ({
      selectedCardIds: state.selectedCardIds.filter((cardId) => cardId !== id)
    }));
  }

  private handleClickSaveSet = (id: string | null, name: string, cardIds: string[]) => {
    const { allCards, user, onSaveSet, history } = this.props;

    if (!user) {
      return;
    }

    const set: w.Set = {
      id: id || generateId(),
      name,
      cards: allCards.filter((card) => cardIds.includes(card.id)),
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NewSet));
