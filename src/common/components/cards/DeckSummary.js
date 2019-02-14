import * as React from 'react';
import { arrayOf, bool, func, object } from 'prop-types';
import Badge from 'material-ui/Badge';
import Paper from '@material-ui/core/Paper';
import FontIcon from 'material-ui/FontIcon';
import { filter, sortBy } from 'lodash';

import { TYPE_ROBOT, TYPE_EVENT, TYPE_STRUCTURE } from '../../constants.ts';
import { groupCards } from '../../util/cards.ts';
import { BUILTIN_FORMATS } from '../../util/formats.ts';
import ButtonInRow from '../ButtonInRow';
import Tooltip from '../Tooltip';
import CardTooltip from '../card/CardTooltip.tsx';
import MustBeLoggedIn from '../users/MustBeLoggedIn';

export default class DeckSummary extends React.Component {
  static propTypes = {
    cards: arrayOf(object),
    deck: object,
    loggedIn: bool,

    onDelete: func,
    onDuplicate: func,
    onEdit: func,
    onTry: func
  };

  get styles() {
    return {
      cardItem: {
        display: 'flex',
        alignItems: 'stretch'
      },
      cardBadgeStyle: {
        backgroundColor: '#00bcd4',
        fontFamily: 'Carter One',
        color: 'white',
        marginRight: 10
      },
      cardBadge: {
        padding: 0,
        width: 24,
        height: 24
      },
      cardName: {
        display: 'flex',
        alignItems: 'center',
        width: 'calc(100% - 24px)'
      },
      cardCount: {
        width: 20,
        display: 'flex',
        alignItems: 'center',
        fontWeight: 'bold'
      },
      validFormatsNote: {
        cursor: 'help',
        fontSize: '0.5em',
        marginLeft: -5,
        marginRight: 5
      }
    };
  }

  get isDefaultDeck() {
    return this.props.deck.id.startsWith('[default-');
  }

  handleClickDelete = () => {
    this.props.onDelete(this.props.deck.id);
  };

  handleClickDuplicate = () => {
    this.props.onDuplicate(this.props.deck.id);
  };

  handleClickEdit = () => {
    this.props.onEdit(this.props.deck.id);
  };

  handleClickTry = () => {
    this.props.onTry(this.props.deck);
  }

  renderCard(card, idx) {
    return (
      <div
        key={idx}
        style={{
          backgroundColor: '#FFFFFF',
          marginBottom: 7,
          height: 24,
          minWidth: 200
      }}>
        <CardTooltip card={card}>
          <div style={this.styles.cardItem}>
            <Badge
              badgeContent={card.cost}
              badgeStyle={this.styles.cardBadgeStyle}
              style={this.styles.cardBadge} />
            <div style={this.styles.cardName}>{card.name}</div>
            <div style={this.styles.cardCount}>{card.count > 1 ? `${card.count}x` : ''}</div>
          </div>
        </CardTooltip>
      </div>
    );
  }

  renderCards(cards) {
    return sortBy(groupCards(cards), ['cost', 'name']).map(this.renderCard.bind(this));
  }

  render() {
    const { cards, deck } = this.props;
    const [robots, structures, events] = [TYPE_ROBOT, TYPE_STRUCTURE, TYPE_EVENT].map(t => filter(cards, ['type', t]));
    const isComplete = (cards.length === 30);

    const numValidFormats = BUILTIN_FORMATS.filter((format) => format.isDeckValid({ cards })).length;
    const redX = '<span style="color: red;">X</span>';
    const greenCheck = '<span style="color: green;">✓</span>';
    const validFormatsHTML = BUILTIN_FORMATS.map((format) =>
      `${format.isDeckValid({ cards }) ? `${greenCheck} valid` : `${redX} not valid`} in ${format.displayName} format`
    ).concat(`${redX} not valid in any Set formats`)  // TODO actually check this once constructing decks from sets is implemented
     .join('<br>');

    return (
      <Paper
        key={deck.name}
        style={{marginRight: 20, marginBottom: 20, padding: 10}}
      >
        <div style={{display: 'flex', marginBottom: 15}}>
          <div style={{flex: 1, fontSize: 32, fontWeight: 100}}>
            {deck.name}
          </div>

          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            textAlign: 'right',
            fontSize: 24,
            color: (isComplete ? 'green' : 'red')}}>
            <Tooltip inline html text={validFormatsHTML} style={{textAlign: 'left'}}>
              <FontIcon
                className="material-icons"
                style={{paddingRight: 5, color: (isComplete ? 'green' : 'red') }}
              >
                {isComplete ? 'done' : 'warning'}
              </FontIcon>
              <sup style={this.styles.validFormatsNote}>
                {numValidFormats}&thinsp;[?]
              </sup>
            </Tooltip>
            {cards.length} cards
          </div>
        </div>

        <MustBeLoggedIn loggedIn={this.props.loggedIn} style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <ButtonInRow
            label="Edit"
            icon="edit"
            tooltip="Edit the cards in this deck."
            onClick={this.handleClickEdit}
            disabled={this.isDefaultDeck} />
          <ButtonInRow
            label="Duplicate"
            icon="add_circle"
            tooltip="Create a copy of this deck."
            onClick={this.handleClickDuplicate} />
          <ButtonInRow
            label="Delete"
            icon="delete"
            tooltip="Delete this deck. This operation cannot be undone!"
            onClick={this.handleClickDelete}
            disabled={this.isDefaultDeck} />
          <ButtonInRow
            label="Try"
            icon="videogame_asset"
            tooltip="Try this deck in a practice game."
            onClick={this.handleClickTry} />
        </MustBeLoggedIn>

        <div style={{padding: '0 10px 10px 10px'}}>
          <div style={{float: 'left', marginRight: 30}}>
            <h4 style={{
              margin: '20px 0 20px -10px'
            }}>Robots ({robots.length})</h4>
            {this.renderCards(robots)}
          </div>

          <div style={{float: 'left'}}>
            <h4 style={{
              margin: '20px 0 20px -10px'
            }}>Structures ({structures.length})</h4>
            {this.renderCards(structures)}

            <h4 style={{
              margin: '20px 0 20px -10px'
            }}>Events ({events.length})</h4>
            {this.renderCards(events)}
          </div>
        </div>
      </Paper>
    );
  }
}
