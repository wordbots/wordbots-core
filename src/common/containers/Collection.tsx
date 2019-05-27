import Paper from '@material-ui/core/Paper';
import { History } from 'history';
import { find, noop } from 'lodash';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { object } from 'prop-types';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Dispatch } from 'redux';

import * as collectionActions from '../actions/collection';
import CardCollection from '../components/cards/CardCollection';
import ExportDialog from '../components/cards/ExportDialog';
import FilterControls from '../components/cards/FilterControls';
import ImportDialog from '../components/cards/ImportDialog';
import LayoutControls from '../components/cards/LayoutControls';
import SearchControls from '../components/cards/SearchControls';
import SortControls from '../components/cards/SortControls';
import RouterDialog from '../components/RouterDialog';
import Title from '../components/Title';
import MustBeLoggedIn from '../components/users/MustBeLoggedIn';
import * as w from '../types';
import { getDisplayedCards, isCardVisible } from '../util/cards';

interface CollectionStateProps {
  cards: w.CardInStore[]
  exportedJson: string | null
  loggedIn: boolean
}

interface CollectionDispatchProps {
  onEditCard: (card: w.CardInStore) => void
  onExportCards: (cards: w.CardInStore[]) => void
  onImportCards: (json: string) => void
  onRemoveFromCollection: (cards: w.CardId[]) => void
}

type CollectionProps = CollectionStateProps & CollectionDispatchProps & { history: History };

interface CollectionState {
  filters: {
    robots: boolean,
    events: boolean,
    structures: boolean
  },
  costRange: [number, number],
  sortCriteria: number,
  sortOrder: number,
  searchText: string,
  selectedCardIds: w.CardId[],
  layout: 0 | 1
}

export function mapStateToProps(state: w.State): CollectionStateProps {
  return {
    cards: state.collection.cards,
    exportedJson: state.collection.exportedJson,
    loggedIn: state.global.user !== null
  };
}

export function mapDispatchToProps(dispatch: Dispatch): CollectionDispatchProps {
  return {
    onEditCard: (card: w.CardInStore) => {
      dispatch(collectionActions.openForEditing(card));
    },
    onExportCards: (cards: w.CardInStore[]) => {
      dispatch(collectionActions.exportCards(cards));
    },
    onImportCards: (json: string) => {
      dispatch(collectionActions.importCards(json));
    },
    onRemoveFromCollection: (cardIds: w.CardId[]) => {
      dispatch(collectionActions.removeFromCollection(cardIds));
    }
  };
}

export class Collection extends React.Component<CollectionProps, CollectionState> {
  // For testing.
  public static childContextTypes = {
    muiTheme: object.isRequired
  };

  public state: CollectionState = {
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

  get displayedCards(): w.CardInStore[] {
    const { searchText, filters, costRange, sortCriteria, sortOrder } = this.state;
    return getDisplayedCards(this.props.cards, { searchText, filters, costRange, sortCriteria, sortOrder });
  }

  // For testing.
  public getChildContext = () => ({muiTheme: getMuiTheme(baseTheme)});

  public render(): JSX.Element {
    return (
      <div>
        <Helmet title="Collection" />
        <Title text="Collection" />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}
        >
          <ExportDialog
            history={this.props.history}
            text={this.props.exportedJson}
          />

          <ImportDialog
            history={this.props.history}
            onImport={this.props.onImportCards}
          />

          <CardCollection
            onlySelectCustomCards
            layout={this.state.layout}
            cards={this.displayedCards}
            selectedCardIds={this.state.selectedCardIds}
            onSelection={this.handleSelectCards}
          />

          <div
            style={{
              margin: '20px 20px 20px 0',
              width: 300,
              minWidth: 300
            }}
          >
            {this.renderSidebarControls()}
            {this.renderSidebarButtons()}
          </div>
        </div>
      </div>
    );
  }

  // Update selected cards with filter.
  private refreshSelection = () => {
    this.setState((state) => ({
      selectedCardIds: state.selectedCardIds.filter((id) => {
        const card = find(this.props.cards, { id });
        return card && isCardVisible(card, state.filters, state.costRange);
      })
    }));
  }

  // this.set(key)(value) = this.setState({key: value})
  private set = (key: keyof CollectionState, callback = noop) => (value: any) => {
    this.setState({[key]: value} as Pick<CollectionState, keyof CollectionState>, callback);
  }

  private toggleFilter = (filter: 'robots' | 'events' | 'structures') => (_e: React.MouseEvent<any>, toggled: boolean) => {
    this.setState((state) => ({
      filters: {...state.filters, [filter]: toggled}
    }), this.refreshSelection);
  }

  private handleSelectCards = (selectedCardIds: w.CardId[]) => {
    this.setState({ selectedCardIds });
  }

  private handleClickNewCard = () => {
    this.props.history.push('/creator');
  }

  private handleClickEdit = () => {
    const id = this.state.selectedCardIds[0];
    const card = this.props.cards.find((c) => c.id === id);
    if (card) {
      this.props.onEditCard(card);
      this.props.history.push('/creator');
    }
  }

  private handleClickDelete = () => {
    this.props.onRemoveFromCollection(this.state.selectedCardIds);
    this.setState({selectedCardIds: []});
  }

  private handleClickExport = () => {
    const cards = this.props.cards.filter((c) => this.state.selectedCardIds.includes(c.id));
    this.setState({selectedCardIds: []}, () => {
      this.props.onExportCards(cards);
      RouterDialog.openDialog(this.props.history, 'export');
    });
  }

  private handleClickImport = () => {
    this.setState({selectedCardIds: []}, () => {
      RouterDialog.openDialog(this.props.history, 'import');
    });
  }

  private renderSidebarControls = () => (
    <Paper style={{padding: 20, marginBottom: 10}}>
      <SearchControls onChange={this.set('searchText')} />

      <LayoutControls
        layout={this.state.layout}
        onSetLayout={this.set('layout')}
      />

      <SortControls
        criteria={this.state.sortCriteria}
        order={this.state.sortOrder}
        onSetCriteria={this.set('sortCriteria')}
        onSetOrder={this.set('sortOrder')}
      />

      <FilterControls
        onToggleFilter={this.toggleFilter}
        onSetCostRange={this.set('costRange', this.refreshSelection)}
      />
    </Paper>
  )

  private renderSidebarButtons = () => (
    <MustBeLoggedIn loggedIn={this.props.loggedIn}>
      <RaisedButton
        label="New Card"
        labelPosition="after"
        secondary
        icon={<FontIcon style={{margin: '0 20px'}} className="material-icons">queue</FontIcon>}
        style={{width: '100%', marginTop: 10, height: 48}}
        buttonStyle={{textAlign: 'left'}}
        onClick={this.handleClickNewCard}
      />
      <RaisedButton
        label="Edit Selected"
        labelPosition="after"
        secondary
        disabled={this.state.selectedCardIds.length !== 1}
        icon={<FontIcon style={{margin: '0 20px'}} className="material-icons">edit</FontIcon>}
        style={{width: '100%', marginTop: 10, height: 48}}
        buttonStyle={{textAlign: 'left'}}
        onClick={this.handleClickEdit}
      />
      <RaisedButton
        label="Delete Selected"
        labelPosition="after"
        secondary
        disabled={this.state.selectedCardIds.length === 0}
        icon={<FontIcon style={{margin: '0 20px'}} className="material-icons">delete</FontIcon>}
        style={{width: '100%', marginTop: 10, height: 48}}
        buttonStyle={{textAlign: 'left'}}
        onClick={this.handleClickDelete}
      />
      <RaisedButton
        label="Export Selected"
        labelPosition="after"
        secondary
        disabled={this.state.selectedCardIds.length === 0}
        icon={<FontIcon style={{margin: '0 20px'}} className="material-icons">file_download</FontIcon>}
        style={{width: '100%', marginTop: 10, height: 48}}
        buttonStyle={{textAlign: 'left'}}
        onClick={this.handleClickExport}
      />
      <RaisedButton
        label="Import Cards"
        labelPosition="after"
        secondary
        icon={<FontIcon style={{margin: '0 20px'}} className="material-icons">file_upload</FontIcon>}
        style={{width: '100%', marginTop: 10, height: 48}}
        buttonStyle={{textAlign: 'left'}}
        onClick={this.handleClickImport}
      />
    </MustBeLoggedIn>
  )
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Collection));
