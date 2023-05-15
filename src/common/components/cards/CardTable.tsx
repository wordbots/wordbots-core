import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import * as moment from 'moment';
import * as React from 'react';

import { typeToString } from '../../constants';
import * as w from '../../types';
import { id } from '../../util/common';
import CardStat from '../card/CardStat';
import InlineCardCostBadge from '../card/InlineCardCostBadge';

import { CardGridOrTableProps } from './CardCollection';

class CardTable extends React.Component<CardGridOrTableProps & WithStyles> {
  public static styles: Record<string, CSSProperties> = {
    tableRoot: {
      width: 'calc(100% - 40px)',
      margin: '20px',
      backgroundColor: 'white',
      boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px',
      '& th': {
        padding: '0 8px 0 12px'
      },
      '& td': {
        borderBottom: '1px solid #aaa',
        padding: '0 8px 0 12px'
      },
      '& .selectableRow': {
        cursor: 'pointer'
      },
      '& .selectableRow:hover': {
        backgroundColor: '#eee'
      },
      '& .selectedRow': {
        border: '1px solid red'
      },
      '& .ra': {
        display: 'inline'
      }
    },
  }

  public render(): JSX.Element {
    const { cards, classes } = this.props;
    return (
      <Table classes={{ root: classes.tableRoot }}>
        <TableHead>
          <TableRow>
            <TableCell style={{ width: 130 }}>Name</TableCell>
            <TableCell style={{ width: 50 }}>Type</TableCell>
            <TableCell style={{ width: 50 }}>Creator</TableCell>
            <TableCell>Text</TableCell>
            <TableCell style={{ width: 25 }}>Attack</TableCell>
            <TableCell style={{ width: 25 }}>Health</TableCell>
            <TableCell style={{ width: 25 }}>Speed</TableCell>
            <TableCell style={{ width: 25 }}>Cost</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cards.map(this.renderCardRow)}
        </TableBody>
      </Table>
    );
  }

  private sourceToString(source: w.CardSource): string {
    if (source.type === 'builtin') {
      return 'Built-In';
    } else {
      return source.username || '';
    }
  }

  private renderCardRowStat(type: w.Attribute, stats: w.CardInStore['stats']): JSX.Element | string {
    if (stats?.[type]) {
      return (
        <CardStat
          noTooltip
          type={type}
          base={(stats || {})[type]}
          current={(stats || {})[type]}
          scale={1}
          style={{ float: 'none', width: 'auto' }}
        />
      );
    } else {
      return '';
    }
  }

  private renderCardRow = (card: w.CardInStore) => {
    const { selectable, selectedCardIds, onCardClick } = this.props;
    const isSelectable = selectable && card.metadata.source.type !== 'builtin';
    const humanizedTimestamp = card.metadata.updated ? (moment as { unix: (timestamp: number) => moment.Moment }).unix(card.metadata.updated / 1000).format('lll') : undefined;

    function handleSelect(_e: React.MouseEvent<HTMLTableRowElement>) {
      if (isSelectable) {
        onCardClick(card.id);
      }
    }

    return (
      <TableRow
        key={card.id || id()}
        className={`${isSelectable ? 'selectableRow' : ''} ${isSelectable && selectedCardIds.includes(card.id) ? 'selectedRow' : ''}`}
        selected={isSelectable && selectedCardIds.includes(card.id)}
        onClick={handleSelect}
      >
        <TableCell style={{ width: 130 }}>{card.name}</TableCell>
        <TableCell style={{ width: 50 }}>{typeToString(card.type)}</TableCell>
        <TableCell style={{ width: 50 }} title={humanizedTimestamp}>{this.sourceToString(card.metadata.source)}</TableCell>
        <TableCell>{card.text}</TableCell>
        <TableCell style={{ width: 25 }}>{this.renderCardRowStat('attack', card.stats)}</TableCell>
        <TableCell style={{ width: 25 }}>{this.renderCardRowStat('health', card.stats)}</TableCell>
        <TableCell style={{ width: 25 }}>{this.renderCardRowStat('speed', card.stats)}</TableCell>
        <TableCell style={{ width: 25 }}><InlineCardCostBadge cost={card.cost} /></TableCell>
      </TableRow>
    );
  }
}

export default withStyles(CardTable.styles)(CardTable);
