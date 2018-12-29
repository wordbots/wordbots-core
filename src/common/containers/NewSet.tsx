import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Paper from '@material-ui/core/Paper';
import { compact, find, noop } from 'lodash';

import * as w from '../../common/types';
import { getDisplayedCards } from '../util/cards';
import ActiveDeck from '../components/cards/ActiveDeck';
import CardCollection from '../components/cards/CardCollection';
import EnergyCurve from '../components/cards/EnergyCurve';
import FilterControls from '../components/cards/FilterControls';
import LayoutControls from '../components/cards/LayoutControls';
import SearchControls from '../components/cards/SearchControls';
import SortControls from '../components/cards/SortControls';

interface NewSetProps {
  setBeingEdited: w.Set | null
  allCards: w.CardInStore[]
  isLoggedIn: boolean
}

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

function mapStateToProps(state: w.State): NewSetProps {
  return {
    setBeingEdited: state.collection.setBeingEdited,
    allCards: state.collection.cards,
    isLoggedIn: state.global.user !== null
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
    return (
      <div>
        <Helmet title="Building Set"/>

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
              allowMultipleSelection
              layout={this.state.layout}
              cards={this.displayedCards}
              selectedCardIds={this.state.selectedCardIds}
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
                id={this.props.setBeingEdited ? this.props.setBeingEdited.id : ''}
                name={this.props.setBeingEdited ? this.props.setBeingEdited.name : ''}
                cards={this.selectedCards}
                loggedIn={this.props.isLoggedIn}
                onRemoveCard={this.handleRemoveCard}
                onSaveDeck={noop} />
            </Paper>
          </div>
        </div>
      </div>
    );
  }

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
}

export default withRouter(connect(mapStateToProps)(NewSet));
