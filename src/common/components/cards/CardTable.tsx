import Badge from 'material-ui/Badge';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import * as React from 'react';

import { typeToString } from '../../constants';
import * as w from '../../types';
import { id } from '../../util/common';
import CardStat from '../card/CardStat';

import { CardGridOrTableProps } from './CardCollection';

export default class CardTable extends React.Component<CardGridOrTableProps> {
  public render(): JSX.Element {
    return (
      <div>
        <div
          style={{
            width: 'calc(100% - 20px)',
            marginRight: 10,
            marginBottom: 20,
            boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px'
          }}
        >
          <Table
            className="cardTable"
            multiSelectable
            selectable={this.props.selectable}
            onCellClick={this.handleCellClick}
            style={{minWidth: 650}}
          >
            <TableHeader
              adjustForCheckbox={false}
              displaySelectAll={false}
              enableSelectAll={false}
            >
              <TableRow>
                <TableHeaderColumn style={{ width: 130}}>Name</TableHeaderColumn>
                <TableHeaderColumn style={{ width: 50}}>Type</TableHeaderColumn>
                <TableHeaderColumn style={{ width: 50}}>Creator</TableHeaderColumn>
                <TableHeaderColumn>Text</TableHeaderColumn>
                <TableHeaderColumn style={{ width: 30}}>Attack</TableHeaderColumn>
                <TableHeaderColumn style={{ width: 30}}>Health</TableHeaderColumn>
                <TableHeaderColumn style={{ width: 30}}>Speed</TableHeaderColumn>
                <TableHeaderColumn style={{ width: 30}}>Cost</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={false}
              deselectOnClickaway={false}
              showRowHover
            >
                {this.props.cards.map(this.renderCardRow)}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  private sourceToString(source: w.CardSource): string {
    if (source.type === 'builtin') {
      return 'Built-In';
    } else {
      return source.username || '';
    }
  }

  private handleCellClick = (row: number) => {
    this.props.onCardClick(this.props.cards[row].id);
  }

  private renderCardRowStat(type: w.Attribute, stats: w.CardInStore['stats']): JSX.Element | string {
    if (stats && stats[type]) {
      return (
        <CardStat
          noTooltip
          type={type}
          base={(stats || {})[type]}
          current={(stats || {})[type]}
          scale={1}
        />
      );
    } else {
      return '';
    }
  }

  private renderCardCost(cost: number): JSX.Element {
    return (
      <Badge
        badgeContent={cost}
        badgeStyle={{
          width: 30, height: 30, backgroundColor: '#00bcd4',
          fontFamily: 'Carter One', fontSize: 16, color: 'white'
        }}
        style={{padding: 0, width: 24, height: 24}}
      />
    );
  }

  private renderCardRow = (card: w.CardInStore) => (
    <TableRow
      key={card.id || id()}
      selected={this.props.selectable && this.props.selectedCardIds.includes(card.id)}
      selectable={!this.props.selectable || card.metadata.source.type === 'builtin'}
    >
      <TableRowColumn style={{width: 130}}>{card.name}</TableRowColumn>
      <TableRowColumn style={{width: 50}}>{typeToString(card.type)}</TableRowColumn>
      <TableRowColumn style={{width: 50}}>{this.sourceToString(card.metadata.source)}</TableRowColumn>
      <TableRowColumn>{card.text}</TableRowColumn>
      <TableRowColumn style={{width: 30, textAlign: 'center'}}>{this.renderCardRowStat('attack', card.stats)}</TableRowColumn>
      <TableRowColumn style={{width: 30, textAlign: 'center'}}>{this.renderCardRowStat('health', card.stats)}</TableRowColumn>
      <TableRowColumn style={{width: 30, textAlign: 'center'}}>{this.renderCardRowStat('speed', card.stats)}</TableRowColumn>
      <TableRowColumn style={{width: 30, textAlign: 'center'}}>{this.renderCardCost(card.cost)}</TableRowColumn>
    </TableRow>
  )
}
