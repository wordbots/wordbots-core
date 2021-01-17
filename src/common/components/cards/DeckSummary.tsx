import Paper from '@material-ui/core/Paper';
import { filter, sortBy } from 'lodash';
import * as React from 'react';

import { TYPE_EVENT, TYPE_ROBOT, TYPE_STRUCTURE } from '../../constants';
import * as w from '../../types';
import { groupCards } from '../../util/cards';
import ButtonInRow from '../ButtonInRow';
import CardTooltip from '../card/CardTooltip';
import InlineCardCostBadge from '../card/InlineCardCostBadge';
import MustBeLoggedIn from '../users/MustBeLoggedIn';

import DeckValidationIndicator from './DeckValidationIndicator';
import { CardWithCount } from './types';

interface DeckSummaryProps {
  cards: w.CardInStore[]
  deck: w.DeckInStore
  set?: w.Set
  loggedIn: boolean
  onDelete: (deckId: string) => void
  onDuplicate: (deckId: string) => void
  onEdit: (deckId: string) => void
  onTry: (deck: w.DeckInStore) => void
}

export default class DeckSummary extends React.Component<DeckSummaryProps> {
  get styles(): Record<string, React.CSSProperties> {
    return {
      card: {
        backgroundColor: '#FFFFFF',
        marginBottom: 7,
        height: 24,
        minWidth: 200
      },
      cardItem: {
        display: 'flex',
        alignItems: 'stretch'
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
      }
    };
  }

  get isDefaultDeck(): boolean {
    return this.props.deck.id.startsWith('[default-');
  }

  public render(): JSX.Element {
    const { cards, deck, set } = this.props;
    const [robots, structures, events] = [TYPE_ROBOT, TYPE_STRUCTURE, TYPE_EVENT].map((t) => filter(cards, ['type', t]));

    return (
      <Paper
        key={deck.name}
        style={{marginRight: 20, marginBottom: 20, padding: 10}}
      >
        <div style={{display: 'flex', marginBottom: 15}}>
          <div style={{flex: 1, fontSize: 32, fontWeight: 100}}>
            {deck.name}
          </div>

          <DeckValidationIndicator deck={deck} cards={cards} set={set} />
        </div>

        <MustBeLoggedIn
          loggedIn={this.props.loggedIn}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%'
          }}
        >
          <ButtonInRow
            label="Edit"
            icon="edit"
            tooltip="Edit the cards in this deck."
            onClick={this.handleClickEdit}
            disabled={this.isDefaultDeck}
          />
          <ButtonInRow
            label="Duplicate"
            icon="add_circle"
            tooltip="Create a copy of this deck."
            onClick={this.handleClickDuplicate}
          />
          <ButtonInRow
            label="Delete"
            icon="delete"
            tooltip="Delete this deck. This operation cannot be undone!"
            onClick={this.handleClickDelete}
            disabled={this.isDefaultDeck}
          />
          <ButtonInRow
            label="Try"
            icon="videogame_asset"
            tooltip="Try this deck in a practice game."
            onClick={this.handleClickTry}
          />
        </MustBeLoggedIn>

        <div style={{padding: '0 10px 10px 10px'}}>
          <div style={{float: 'left', marginRight: 30}}>
            <h4
              style={{
                margin: '20px 0 20px -10px'
              }}
            >
              Robots ({robots.length})
            </h4>
            {this.renderCards(robots)}
          </div>

          <div style={{float: 'left'}}>
            <h4
              style={{
                margin: '20px 0 20px -10px'
              }}
            >
              Structures ({structures.length})
            </h4>
            {this.renderCards(structures)}

            <h4
              style={{
                margin: '20px 0 20px -10px'
              }}
            >
              Events ({events.length})
            </h4>
            {this.renderCards(events)}
          </div>
        </div>
      </Paper>
    );
  }

  private handleClickDelete = () => {
    this.props.onDelete(this.props.deck.id);
  }

  private handleClickDuplicate = () => {
    this.props.onDuplicate(this.props.deck.id);
  }

  private handleClickEdit = () => {
    this.props.onEdit(this.props.deck.id);
  }

  private handleClickTry = () => {
    this.props.onTry(this.props.deck);
  }

  private renderCard(card: CardWithCount, idx: number): JSX.Element {
    return (
      <div
        key={idx}
        style={this.styles.card}
      >
        <CardTooltip card={card}>
          <div style={this.styles.cardItem}>
            <InlineCardCostBadge cost={card.cost} style={{ position: 'relative', left: -10 }} />
            <div style={this.styles.cardName}>{card.name}</div>
            <div style={this.styles.cardCount}>{card.count > 1 ? `${card.count}x` : ''}</div>
          </div>
        </CardTooltip>
      </div>
    );
  }

  private renderCards(cards: w.CardInStore[]): JSX.Element[] {
    return sortBy(groupCards(cards), ['cost', 'name']).map(this.renderCard.bind(this));
  }
}
