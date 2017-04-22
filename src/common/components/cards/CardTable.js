import React, { Component } from 'react';
import { array, func, number, string } from 'prop-types';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn }
  from 'material-ui/Table';
import Badge from 'material-ui/Badge';

import { typeToString } from '../../constants';
import CardStat from '../card/CardStat';

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
        <TableRowColumn width={200}>{card.name}</TableRowColumn>
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
    return (
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        width: 'calc(100% - 20px)',
        marginRight: 10
      }}>
        <Table
          multiSelectable
          onRowSelection={(selectedRows) => {
            if (selectedRows === 'none') {
              this.props.onSelection([]);
            } else {
              this.props.onSelection(selectedRows.map(rowIndex => this.props.cards[rowIndex].id));
            }
          }}>
          <TableHeader
            adjustForCheckbox
            displaySelectAll={false}
            enableSelectAll={false}>
            <TableRow>
              <TableHeaderColumn width={200}>Name</TableHeaderColumn>
              <TableHeaderColumn width={100}>Type</TableHeaderColumn>
              <TableHeaderColumn width={50}>Creator</TableHeaderColumn>
              <TableHeaderColumn>Card Text</TableHeaderColumn>
              <TableHeaderColumn width={30}>Attack</TableHeaderColumn>
              <TableHeaderColumn width={30}>Health</TableHeaderColumn>
              <TableHeaderColumn width={30}>Speed</TableHeaderColumn>
              <TableHeaderColumn width={30}>Cost</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox
            deselectOnClickaway
            showRowHover>
              {this.props.cards.map(this.renderCardRow.bind(this))}
          </TableBody>
        </Table>
      </div>
    );
  }
}

