import React, { Component } from 'react';
import { arrayOf, bool, func, object, string } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import FontIcon from 'material-ui/FontIcon';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { find, noop } from 'lodash';

import { getDisplayedCards, isCardVisible } from '../util/cards';
import RouterDialog from '../components/RouterDialog';
import CardCollection from '../components/cards/CardCollection';
import ExportDialog from '../components/cards/ExportDialog';
import ImportDialog from '../components/cards/ImportDialog';
import FilterControls from '../components/cards/FilterControls';
import LayoutControls from '../components/cards/LayoutControls';
import SearchControls from '../components/cards/SearchControls';
import SortControls from '../components/cards/SortControls';
import MustBeLoggedIn from '../components/users/MustBeLoggedIn';
import * as collectionActions from '../actions/collection';

export function mapStateToProps(state) {
  return {
    cards: state.collection.cards,
    exportedJson: state.collection.exportedJson,
    loggedIn: state.global.user !== null,
    sidebarOpen: state.global.sidebarOpen
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    onEditCard: (card) => {
      dispatch(collectionActions.openForEditing(card));
    },
    onExportCards: (cards) => {
      dispatch(collectionActions.exportCards(cards));
    },
    onImportCards: (json) => {
      dispatch(collectionActions.importCards(json));
    },
    onRemoveFromCollection: (cards) => {
      dispatch(collectionActions.removeFromCollection(cards));
    }
  };
}

export class Collection extends Component {
  static propTypes = {
    cards: arrayOf(object),
    exportedJson: string,
    loggedIn: bool,

    history: object,

    onEditCard: func,
    onExportCards: func,
    onImportCards: func,
    onRemoveFromCollection: func
  };

  constructor(props) {
    super(props);

    this.state = {
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
  }

  // For testing.
  static childContextTypes = {
    muiTheme: object.isRequired
  };
  getChildContext = () => ({muiTheme: getMuiTheme(baseTheme)})

  get displayedCards() {
    const { searchText, filters, costRange, sortCriteria, sortOrder } = this.state;
    return getDisplayedCards(this.props.cards, { searchText, filters, costRange, sortCriteria, sortOrder });
  }

  // Update selected cards with filter.
  refreshSelection = () => {
    this.setState(state => ({
      selectedCardIds: state.selectedCardIds.filter(id =>
        isCardVisible(find(this.props.cards, { id }), this.state.filters, this.state.costRange)
      )
    }));
  }

  // this.set(key)(value) = this.setState({key: value})
  set = (key, callback = noop) => (value) => {
    this.setState({[key]: value}, callback);
  }

  toggleFilter = (filter) => (e, toggled) => {
    this.setState(state => ({
      filters: Object.assign({}, state.filters, {[filter]: toggled})
    }), this.refreshSelection);
  }

  handleSelectCards = (selectedCards) => {
    this.setState({selectedCardIds: selectedCards});
  }

  handleClickNewCard = () => {
    this.props.history.push('/creator');
  }

  handleClickEdit = () => {
    const id = this.state.selectedCardIds[0];
    this.props.onEditCard(this.props.cards.find(c => c.id === id));
    this.props.history.push('/creator');
  }

  handleClickDelete = () => {
    this.props.onRemoveFromCollection(this.state.selectedCardIds);
    this.setState({selectedCardIds: []});
  }

  handleClickExport = () => {
    const cards = this.props.cards.filter(c => this.state.selectedCardIds.includes(c.id));
    this.setState({selectedCardIds: []}, () => {
      this.props.onExportCards(cards);
      RouterDialog.openDialog(this.props.history, 'export');
    });
  }

  handleClickImport = () => {
    this.setState({selectedCardIds: []}, () => {
      RouterDialog.openDialog(this.props.history, 'import');
    });
  }

  renderSidebarControls = () => (
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
        onSetCostRange={this.set('costRange', this.refreshSelection)} />
    </Paper>
  )

  renderSidebarButtons = () => (
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

  render() {
    return (
      <div>
        <Helmet title="Collection"/>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <ExportDialog
            history={this.props.history}
            text={this.props.exportedJson} />

          <ImportDialog
            history={this.props.history}
            onImport={this.props.onImportCards} />

          <div style={{marginTop: 10, marginLeft: 40, width: '100%'}}>
            <div>
              <CardCollection
                onlySelectCustomCards
                layout={this.state.layout}
                cards={this.displayedCards}
                selectedCardIds={this.state.selectedCardIds}
                onSelection={this.handleSelectCards} />
            </div>
          </div>

          <div style={{
            margin: '30px 50px 50px 0',
            width: 300,
            minWidth: 300
          }}>
            {this.renderSidebarControls()}
            {this.renderSidebarButtons()}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Collection));
