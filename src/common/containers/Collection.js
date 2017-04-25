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
import { without } from 'lodash';

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
      importDialogOpen: false,
      layout: 0
    };
  }

  isCardVisible(card) {
    return isCardVisible(card, this.state.filters, this.state.costRange);
  }

  updateSelectedCardsWithFilter() {
    this.setState(state => (
      {selectedCardIds: state.selectedCardIds.filter(id => this.isCardVisible(this.props.cards.find(c => c.id === id)))}
    ));
  }

  toggleFilter(filter) {
    return (e, toggled) => {
      this.setState(
        state => ({filters: Object.assign({}, state.filters, {[filter]: toggled})}),
        () => { this.updateSelectedCardsWithFilter(); }
      );
    };
  }

  searchCards(card) {
    return (card.name.toLowerCase().includes(this.state.searchText.toLowerCase()) ||
      (card.text || '').toLowerCase().includes(this.state.searchText.toLowerCase()));
  }

  sortCards(a, b) {
    const f = sortFunctions[this.state.sortingCriteria];

    if (f(a) < f(b)) {
      return this.state.sortingOrder ? 1 : -1;
    } else if (f(a) > f(b)) {
      return this.state.sortingOrder ? -1 : 1;
    } else {
      return 0;
    }
  }

  renderCardCollection() {
    const cards = this.props.cards
      .filter(this.searchCards.bind(this))
      .filter(this.isCardVisible.bind(this))
      .sort(this.sortCards.bind(this));

    if (this.state.layout === 0) {
      return (
        <CardGrid
          cards={cards}
          selectedCardIds={this.state.selectedCardIds}
          onCardClick={id => {
            const card = this.props.cards.find(c => c.id === id);
            if (card.source !== 'builtin') {
              this.setState(state => {
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
          cards={cards}
          onSelection={selectedRows => { this.setState({selectedCardIds: selectedRows}); }}/>
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
            onClose={() => { this.setState({importDialogOpen: false}); }}
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
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 20
              }}>Layout</div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                marginBottom: 20
              }}>
                <FontIcon
                  className="material-icons"
                  style={{
                    color: 'black',
                    fontSize: 36,
                    padding: 10,
                    borderRadius: 3,
                    boxShadow: '1px 1px 3px #CCC',
                    backgroundColor: this.state.layout === 0 ?
                      '#FFC7C3' :
                      '#EEEEEE',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'center',
                    marginRight: 10
                  }}
                  onClick={() => { this.setState({layout: 0});}}>
                  view_module
                </FontIcon>
                <FontIcon
                  className="material-icons"
                  style={{
                    color: 'black',
                    fontSize: 36,
                    padding: 10,
                    borderRadius: 3,
                    boxShadow: '1px 1px 3px #CCC',
                    backgroundColor: this.state.layout === 0 ?
                      '#EEEEEE' :
                      '#FFC7C3',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'center'
                  }}
                  onClick={() => { this.setState({layout: 1});}}>
                  view_list
                </FontIcon>
              </div>

              <div style={{
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 10
              }}>Search</div>

              <TextField
                hintText="Enter card name or text"
                style={{marginBottom: 10}}
                onChange={(event, newValue) => { this.setState({searchText: newValue}); }}/>

              <SortControls
                criteria={this.state.sortingCriteria}
                order={this.state.sortingOrder}
                onSetCriteria={value => { this.setState({sortingCriteria: value}); }}
                onSetOrder={value => { this.setState({sortingOrder: value}); }} />

              <FilterControls
                onToggleFilter={this.toggleFilter.bind(this)}
                onSetCostRange={values => {
                  this.setState({costRange: values}, () => { this.updateSelectedCardsWithFilter(); });
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
                this.setState({selectedCardIds: []});
              }}
            />
            <RaisedButton
              label="Export Selected"
              labelPosition="before"
              secondary
              icon={<FontIcon className="material-icons">file_download</FontIcon>}
              style={{width: '100%', marginTop: 20}}
              onClick={() => {
                const cards = this.props.cards.filter(c => this.state.selectedCardIds.includes(c.id));
                this.props.onExportCards(cards);
                this.setState({selectedCardIds: []});
              }}
            />
            <RaisedButton
              label="Import Cards"
              labelPosition="before"
              secondary
              icon={<FontIcon className="material-icons">file_upload</FontIcon>}
              style={{width: '100%', marginTop: 20}}
              onClick={() => {
                this.setState({importDialogOpen: true, selectedCardIds: []});
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Collection));
