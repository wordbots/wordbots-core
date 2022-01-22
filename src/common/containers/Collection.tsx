import Paper from '@material-ui/core/Paper';
import * as fb from 'firebase';
import { History } from 'history';
import { find, noop } from 'lodash';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as CopyToClipboard from 'react-copy-to-clipboard';
import { Dispatch } from 'redux';

import * as collectionActions from '../actions/collection';
import * as gameActions from '../actions/game';
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
import Background from '../components/Background';
import ToolbarButton from '../components/ToolbarButton';

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
  onStartSandbox: (card: w.CardInStore) => void
}

type CollectionProps = CollectionStateProps & CollectionDispatchProps & { history: History };

interface CollectionState {
  filters: {
    robots: boolean
    events: boolean
    structures: boolean
  }
  costRange: [number, number]
  sortCriteria: number
  sortOrder: number
  searchText: string
  selectedCardIds: w.CardId[]
  layout: 0 | 1
  isPermalinkCopied: boolean
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
    },
    onStartSandbox: (card: w.CardInStore) => {
      dispatch(gameActions.startSandbox(card));
    },
  };
}

export class Collection extends React.Component<CollectionProps, CollectionState> {
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
    layout: 0,
    isPermalinkCopied: false
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

  public render(): JSX.Element {
    const { exportedJson, history, loggedIn, onImportCards } = this.props;

    return (
      <div>
        <Helmet title="Collection" />
        <Background asset="compressed/Conveyor 03.jpg" opacity={0.45} />

        <Title text="Collection" />
        <div style={{ display: 'inline', paddingLeft: 10 }}>
          {loggedIn && this.renderButtons(true)}
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
      }),
      isPermalinkCopied: false
    }));
  }

  // this.set(key)(value) = this.setState({key: value})
  private set = (key: keyof CollectionState, callback = noop) => (value: any) => {
    this.setState({[key]: value} as Pick<CollectionState, keyof CollectionState>, callback);
  }

  private toggleFilter = (filter: 'robots' | 'events' | 'structures') => (_e: React.ChangeEvent<any>, toggled: boolean) => {
    this.setState((state) => ({
      filters: {...state.filters, [filter]: toggled}
    }), this.refreshSelection);
  }

  private handleSelectCards = (selectedCardIds: w.CardId[]) => {
    this.setState({
      selectedCardIds,
      isPermalinkCopied: false
    });
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
      this.setState({ selectedCardIds: [], isPermalinkCopied: false });
    }
  }

  private handleClickDelete = () => {
    this.props.onRemoveFromCollection(this.state.selectedCardIds);
    this.setState({ selectedCardIds: [], isPermalinkCopied: false });
  }

  private handleClickExport = () => {
    const cards = this.props.cards.filter((c) => this.state.selectedCardIds.includes(c.id));
    this.setState({ selectedCardIds: [], isPermalinkCopied: false }, () => {
      this.props.onExportCards(cards);
      RouterDialog.openDialog(this.props.history, 'export');
    });
  }

  private handleClickImport = () => {
    this.setState({ selectedCardIds: [], isPermalinkCopied: false }, () => {
      RouterDialog.openDialog(this.props.history, 'import');
    });
  }

  private handleClickTest = () => {
    const card = this.props.cards.find((c) => this.state.selectedCardIds.includes(c.id));
    if (card) {
      this.props.onStartSandbox(card);
      this.props.history.push('/play/sandbox', { previous: this.props.history.location });
    }
  }

  private afterCopyPermalink = () => {
    this.setState({ isPermalinkCopied: true });
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

  /** render Collection buttons on top bar or sidebar */
  private renderButtons = (onTopBar: boolean) => {
    const { loggedIn } = this.props;
    const { isPermalinkCopied, selectedCardIds } = this.state;

    return (
      <MustBeLoggedIn loggedIn={loggedIn} style={{ display: 'inline' }}>
        <ToolbarButton
          vertical={!onTopBar}
          icon="queue"
          onClick={this.handleClickNewCard}
        >
          New Card
        </ToolbarButton>
        <ToolbarButton
          color="primary"
          vertical={!onTopBar}
          icon="edit"
          onClick={this.handleClickEdit}
          disabled={!this.canEditSelectedCard}
        >
          {onTopBar ? 'Edit' : 'Edit Selected'}
        </ToolbarButton>
        <ToolbarButton
          color="primary"
          vertical={!onTopBar}
          icon="file_copy"
          onClick={this.handleClickDuplicate}
          disabled={selectedCardIds.length !== 1}
        >
          {onTopBar ? 'Duplicate' : 'Duplicate Selected'}
        </ToolbarButton>
        <ToolbarButton
          color="primary"
          vertical={!onTopBar}
          icon="delete"
          onClick={this.handleClickDelete}
          disabled={selectedCardIds.length === 0}
        >
          {onTopBar ? 'Delete' : 'Delete Selected'}
        </ToolbarButton>

        {onTopBar
          ? <>
              <ToolbarButton
                color="primary"
                icon="videogame_asset"
                onClick={this.handleClickTest}
                disabled={selectedCardIds.length !== 1}
              >
                Test
              </ToolbarButton>
              <CopyToClipboard
                text={`${location.origin}/card/${selectedCardIds[0]}`}
                onCopy={this.afterCopyPermalink}
              >
                <ToolbarButton
                  color="primary"
                  icon={isPermalinkCopied ? null : 'link'}
                  onClick={noop}
                  disabled={selectedCardIds.length !== 1 || isPermalinkCopied}
                >
                  {isPermalinkCopied ? 'Copied!' : 'permalink'}
                </ToolbarButton>
              </CopyToClipboard>
            </>
          : <>
              <ToolbarButton
                color="primary"
                vertical
                icon="file_download"
                onClick={this.handleClickExport}
                disabled={selectedCardIds.length === 0}
              >
                Export Selected
              </ToolbarButton>
              <ToolbarButton
                color="primary"
                vertical
                icon="file_upload"
                onClick={this.handleClickImport}
              >
                Import Cards
              </ToolbarButton>
            </>
        }
      </MustBeLoggedIn>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Collection));
