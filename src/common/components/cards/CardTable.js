import React, { Component } from 'react';
import { array, func, number, string } from 'prop-types';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn }
  from 'material-ui/Table';
import Badge from 'material-ui/Badge';

import { typeToString } from '../../constants';
import CardStat from '../card/CardStat';

import PageSwitcher from './PageSwitcher';

export default class CardTable extends Component {
  static propTypes = {
    cards: array,
    selectedCardIds: array,
    filterFunc: func,
    sortFunc: func,
    sortOrder: number,
    searchText: string,

    onSelection: func
  };

  constructor(props) {
    super(props);

    this.state = {
      page: 1
    };
  }

  sourceToString(source) {
    if (source === 'user') {
      return 'You';
    } else {
      return 'Built-In';
    }
  }

  renderCardRowStat(type, stats) {
    if (stats && stats[type]) {
      return (
        <CardStat 
          type={type} 
          base={stats ? stats[type] : ''} 
          current={stats ? stats[type] : ''}
          scale={1} />
      );
    } else {
      return '';
    }
  }

  renderCardRow(card, index) {
    return (
      <TableRow 
        key={card.id} 
        selected={(this.props.selectedCardIds || []).includes(card.id)} 
        selectable={card.source === 'user'}>
        <TableRowColumn width={100} tooltip={card.name} tooltipPosition="bottom-center">{card.name}</TableRowColumn>
        <TableRowColumn width={100}>{typeToString(card.type)}</TableRowColumn>
        <TableRowColumn width={50}>{this.sourceToString(card.source)}</TableRowColumn>
        <TableRowColumn>{card.text}</TableRowColumn>
        <TableRowColumn width={30} style={{textAlign: 'center'}}>{this.renderCardRowStat('attack', card.stats)}</TableRowColumn>
        <TableRowColumn width={30} style={{textAlign: 'center'}}>{this.renderCardRowStat('health', card.stats)}</TableRowColumn>
        <TableRowColumn width={30} style={{textAlign: 'center'}}>{this.renderCardRowStat('speed', card.stats)}</TableRowColumn>
        <TableRowColumn width={30} style={{textAlign: 'center'}}>
          <Badge
            badgeContent={card.cost}
            badgeStyle={{backgroundColor: '#00bcd4', fontFamily: 'Carter One', color: 'white'}}
            style={{padding: 0, width: 24, height: 24 }} />
        </TableRowColumn>
      </TableRow>
    );
  }

  render() {
    const firstCardOnPage = (this.state.page - 1) * 20;
    const cards = this.props.cards.slice(firstCardOnPage, firstCardOnPage + 20);
    const maxPages = Math.floor(this.props.cards.length / 20) + 1;

    return (
      <div>
        <div style={{
          width: 'calc(100% - 20px)',
          marginRight: 10,
          marginBottom: 20,
          boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px'
        }}>
          <Table
            multiSelectable
            onRowSelection={(selectedRows) => {
              if (selectedRows === 'none') {
                this.props.onSelection([]);
              } else {
                this.props.onSelection(selectedRows.map(rowIndex => cards[rowIndex].id));
              }
            }}>
            <TableHeader
              adjustForCheckbox={false}
              displaySelectAll={false}
              enableSelectAll={false}
              style={{backgroundColor: '#f44336'}}>
              <TableRow>
                <TableHeaderColumn width={100} style={{color: 'white'}}>Name</TableHeaderColumn>
                <TableHeaderColumn width={100} style={{color: 'white'}}>Type</TableHeaderColumn>
                <TableHeaderColumn width={50} style={{color: 'white'}}>Creator</TableHeaderColumn>
                <TableHeaderColumn style={{color: 'white'}}>Card Text</TableHeaderColumn>
                <TableHeaderColumn width={30} style={{color: 'white'}}>Attack</TableHeaderColumn>
                <TableHeaderColumn width={30} style={{color: 'white'}}>Health</TableHeaderColumn>
                <TableHeaderColumn width={30} style={{color: 'white'}}>Speed</TableHeaderColumn>
                <TableHeaderColumn width={30} style={{color: 'white'}}>Cost</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={false}
              deselectOnClickaway={false}
              showRowHover>
                {cards.map(this.renderCardRow.bind(this))}
            </TableBody>
          </Table>
        </div>
        <PageSwitcher
          page={this.state.page}
          maxPages={maxPages}
          prevPage={() => this.setState({page: this.state.page - 1})}
          nextPage={() => this.setState({page: this.state.page + 1})}/>
      </div>
    );
  }
}

