import React, { Component } from 'react';
import { array, bool, func, object, string } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import FontIcon from 'material-ui/FontIcon';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { isFunction, without } from 'lodash';

import { isCardVisible, sortFunctions } from '../util/cards';
import CardBack from '../components/card/CardBack';
import CardGrid from '../components/cards/CardGrid';
import CardTable from '../components/cards/CardTable';
import ExportDialog from '../components/cards/ExportDialog';
import FilterControls from '../components/cards/FilterControls';
import ImportDialog from '../components/cards/ImportDialog';
import SortControls from '../components/cards/SortControls';
import * as collectionActions from '../actions/collection';

function mapStateToProps(state) {
  return {
    cards: state.collection.cards,
    exportedJson: state.collection.exportedJson,
    sidebarOpen: state.layout.present.sidebarOpen
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onCloseExportDialog: () => {
      dispatch(collectionActions.closeExportDialog());
    },
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

class Collection extends Component {
  static propTypes = {
    cards: array,
    exportedJson: string,
    sidebarOpen: bool,

    history: object,

    onCloseExportDialog: func,
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
      sortingCriteria: 3,
      searchText: '',
      sortingOrder: 0,
      selectedCardIds: [],
      importDialogOpen: false
    };
  }

  isCardVisible(card) {
    return isCardVisible(card, this.state.filters, this.state.costRange);
  }

  updateState(newProps, callback = () => {}) {
    this.setState((s =>
      Object.assign({}, s, isFunction(newProps) ? newProps(s) : newProps)
    ), callback);
  }

  updateSelectedCardsWithFilter() {
    this.updateState(state => (
      {selectedCardIds: state.selectedCardIds.filter(id => this.isCardVisible(this.props.cards.find(c => c.id === id)))}
    ));
  }

  toggleFilter(filter) {
    return (e, toggled) => {
      this.updateState(
        state => ({filters: Object.assign({}, state.filters, {[filter]: toggled})}),
        () => { this.updateSelectedCardsWithFilter(); }
      );
    };
  }

  renderCardCollection() {
    if (this.state.view === 0) {
      return (
        <CardGrid
          cards={this.props.cards}
          selectedCardIds={this.state.selectedCardIds}
          filterFunc={this.isCardVisible.bind(this)}
          sortFunc={sortFunctions[this.state.sortingCriteria]}
          sortOrder={this.state.sortingOrder}
          searchText={this.state.searchText}
          onCardClick={id => {
            const card = this.props.cards.find(c => c.id === id);
            if (card.source !== 'builtin') {
              this.updateState(state => {
                if (state.selectedCardIds.includes(id)) {
                  return {selectedCardIds: without(state.selectedCardIds, id)};
                } else {
                  return {selectedCardIds: [...state.selectedCardIds, id]};
                }
              });
            }
          }}>
          <Link to="/creator">
            <div style={{padding: '24px 0 12px 0', marginRight: 15}}>
              <CardBack hoverable customText="New Card" />
            </div>
          </Link>
        </CardGrid>
      );
    } else {
      return (
        <CardTable
          cards={this.props.cards}
          filterFunc={this.isCardVisible.bind(this)}
          sortFunc={sortFunctions[this.state.sortingCriteria]}
          sortOrder={this.state.sortingOrder}
          searchText={this.state.searchText}
          onSelection={(selectedRows) => {
            if (selectedRows === 'all') {
              console.log(selectedRows);
            } else {
              console.log(selectedRows);
            }
          }}/>
      );
    }
  }

  render() {
    return (
      <div style={{height: '100%', paddingLeft: this.props.sidebarOpen ? 256 : 0}}>
        <Helmet title="Collection"/>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <ExportDialog
            open={this.props.exportedJson !== null}
            text={this.props.exportedJson}
            onClose={this.props.onCloseExportDialog}
            />

          <ImportDialog
            open={this.state.importDialogOpen}
            onClose={() => { this.updateState({importDialogOpen: false}); }}
            onImport={this.props.onImportCards}
            />

          <div style={{marginTop: 50, marginLeft: 40}}>
            {this.renderCardCollection()}
          </div>

          <div style={{
            margin: 50,
            marginLeft: 0,
            width: 300,
            minWidth: 300
          }}>
            <Paper style={{
              padding: 20
            }}>
              <div style={{
                fontWeight: 100,
                fontSize: 28,
                marginBottom: 20
              }}>Filters</div>

              <div style={{
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 10
              }}>Search</div>

              <TextField hintText="Search for cards." style={{marginBottom: 10}} onChange={(event, newValue) => {
                this.setState({searchText: newValue});
              }}/>

              <SortControls
                criteria={this.state.sortingCriteria}
                order={this.state.sortingOrder}
                onSetCriteria={value => { this.updateState({sortingCriteria: value}); }}
                onSetOrder={value => { this.updateState({sortingOrder: value}); }}
                />
              <FilterControls
                onToggleFilter={this.toggleFilter.bind(this)}
                onSetCostRange={values => {
                  this.updateState({costRange: values}, () => { this.updateSelectedCardsWithFilter(); });
                }} />
            </Paper>

            <RaisedButton
              label="Edit Selected"
              labelPosition="before"
              secondary
              disabled={this.state.selectedCardIds.length !== 1}
              icon={<FontIcon className="material-icons">edit</FontIcon>}
              style={{width: '100%', marginTop: 20}}
              onClick={() => {
                const id = this.state.selectedCardIds[0];
                this.props.onEditCard(this.props.cards.find(c => c.id === id));
                this.props.history.push('/creator');
              }}
            />
            <RaisedButton
              label="Delete Selected"
              labelPosition="before"
              secondary
              disabled={this.state.selectedCardIds.length === 0}
              icon={<FontIcon className="material-icons">delete</FontIcon>}
              style={{width: '100%', marginTop: 20}}
              onClick={() => {
                this.props.onRemoveFromCollection(this.state.selectedCardIds);
                this.updateState({selectedCardIds: []});
              }}
            />
            <RaisedButton
              label="Export Selected"
              labelPosition="before"
              secondary
              disabled={this.state.selectedCardIds.length === 0}
              icon={<FontIcon className="material-icons">file_download</FontIcon>}
              style={{width: '100%', marginTop: 20}}
              onClick={() => {
                const cards = this.props.cards.filter(c => this.state.selectedCardIds.includes(c.id));
                this.props.onExportCards(cards);
                this.updateState({selectedCardIds: []});
              }}
            />
            <RaisedButton
              label="Import Cards"
              labelPosition="before"
              secondary
              icon={<FontIcon className="material-icons">file_upload</FontIcon>}
              style={{width: '100%', marginTop: 20}}
              onClick={() => {
                this.updateState({importDialogOpen: true, selectedCardIds: []});
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Collection));
