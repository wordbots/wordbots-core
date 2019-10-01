import Paper from '@material-ui/core/Paper';
import * as fb from 'firebase';
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
import { SortCriteria, SortOrder } from '../components/cards/types.enums';
import RouterDialog from '../components/RouterDialog';
import Title from '../components/Title';
import MustBeLoggedIn from '../components/users/MustBeLoggedIn';
import * as w from '../types';
import { getDisplayedCards, isCardVisible } from '../util/cards';
import { lookupCurrentUser } from '../util/firebase';

interface CollectionStateProps {
  cards: w.CardInStore[]
  exportedJson: string | null
  loggedIn: boolean
}

interface CollectionDispatchProps {
  onDuplicateCard: (card: w.CardInStore) => void
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
    onDuplicateCard: (card: w.CardInStore) => {
      dispatch(collectionActions.duplicateCard(card));
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
    sortCriteria: SortCriteria.Timestamp,
    sortOrder: SortOrder.Ascending,
    searchText: '',
    selectedCardIds: [],
    layout: 0
  };

  get displayedCards(): w.CardInStore[] {
    const { searchText, filters, costRange, sortCriteria, sortOrder } = this.state;
    return getDisplayedCards(this.props.cards, { searchText, filters, costRange, sortCriteria, sortOrder });
  }

  get canEditSelectedCard(): boolean {
    const { cards } = this.props;
    const { selectedCardIds } = this.state;
    if (selectedCardIds.length === 1) {
      const currentUser: fb.User | null = lookupCurrentUser();
      const card = cards.find((c) => c.id === selectedCardIds[0]);
      if (card && currentUser) {
        const { source } = card.metadata;
        return source.type === 'user' && source.uid === currentUser.uid;
      }
    }

    return false;
  }

  // For testing.
  public getChildContext = () => ({muiTheme: getMuiTheme(baseTheme)});

  public render(): JSX.Element {
    const { exportedJson, history, loggedIn, onImportCards } = this.props;

    return (
      <div>
        <Helmet title="Collection" />
        <div style={{ display: 'flex' }}>
          <Title text="Collection" />
          <div style={{ marginLeft: 30, marginTop: 12 }}>
            {loggedIn && this.renderButtons(true)}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}
        >
          <ExportDialog
            history={history}
            text={exportedJson}
          />

          <ImportDialog
            history={history}
            onImport={onImportCards}
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
            {this.renderButtons(false)}
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
    this.props.history.push('/card/new');
  }

  private handleClickEdit = () => {
    if (this.canEditSelectedCard) {
      const id = this.state.selectedCardIds[0];
      const card = this.props.cards.find((c) => c.id === id)!;
      this.props.history.push(`/card/${card.id}`, { card });
    }
  }

  private handleClickDuplicate = () => {
    const card = this.props.cards.find((c) => this.state.selectedCardIds.includes(c.id));
    if (card) {
      this.props.onDuplicateCard(card);
      this.setState({selectedCardIds: []});
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

  private renderButtons = (compact: boolean) => {
    const { loggedIn } = this.props;
    const style = compact ? { marginLeft: 10 } : { width: '100%', marginTop: 10, height: 48 };
    const iconStyle = compact ? { margin: '0 5px 0 15px' } : { margin: '0 20px' };

    return (
      <MustBeLoggedIn loggedIn={loggedIn}>
        <RaisedButton
          label="New Card"
          labelPosition="after"
          primary
          icon={<FontIcon style={iconStyle} className="material-icons">queue</FontIcon>}
          style={style}
          buttonStyle={{textAlign: 'left'}}
          onClick={this.handleClickNewCard}
        />
        <RaisedButton
          label={compact ? 'Edit' : 'Edit Selected'}
          labelPosition="after"
          secondary
          disabled={!this.canEditSelectedCard}
          icon={<FontIcon style={iconStyle} className="material-icons">edit</FontIcon>}
          style={style}
          buttonStyle={{textAlign: 'left'}}
          onClick={this.handleClickEdit}
        />
        <RaisedButton
          label={compact ? 'Duplicate' : 'Duplicate Selected'}
          labelPosition="after"
          secondary
          disabled={this.state.selectedCardIds.length !== 1}
          icon={<FontIcon style={iconStyle} className="material-icons">file_copy</FontIcon>}
          style={style}
          buttonStyle={{textAlign: 'left'}}
          onClick={this.handleClickDuplicate}
        />
        <RaisedButton
          label={compact ? 'Delete' : 'Delete Selected'}
          labelPosition="after"
          secondary
          disabled={this.state.selectedCardIds.length === 0}
          icon={<FontIcon style={iconStyle} className="material-icons">delete</FontIcon>}
          style={style}
          buttonStyle={{textAlign: 'left'}}
          onClick={this.handleClickDelete}
        />
        {compact ? null : <RaisedButton
          label="Export Selected"
          labelPosition="after"
          secondary
          disabled={this.state.selectedCardIds.length === 0}
          icon={<FontIcon style={iconStyle} className="material-icons">file_download</FontIcon>}
          style={style}
          buttonStyle={{textAlign: 'left'}}
          onClick={this.handleClickExport}
        />}
        {compact ? null : <RaisedButton
          label="Import Cards"
          labelPosition="after"
          secondary
          icon={<FontIcon style={iconStyle} className="material-icons">file_upload</FontIcon>}
          style={style}
          buttonStyle={{textAlign: 'left'}}
          onClick={this.handleClickImport}
        />}
      </MustBeLoggedIn>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Collection));
