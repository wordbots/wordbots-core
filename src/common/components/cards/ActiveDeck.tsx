import { identity, sortBy } from 'lodash';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Icon from '@material-ui/core/Icon';
import TextField from '@material-ui/core/TextField';
import * as React from 'react';
import { FormControlLabel } from '@material-ui/core';

import { MAX_Z_INDEX, TYPE_EVENT, TYPE_ROBOT, TYPE_STRUCTURE } from '../../constants';
import * as w from '../../types';
import Tooltip from '../Tooltip';
import MustBeLoggedIn from '../users/MustBeLoggedIn';
import RaritySymbol from '../card/RaritySymbol';

import { groupCards, selectType } from './utils';
import ActiveDeckCard from './ActiveDeckCard';
import DeckValidationIndicator from './DeckValidationIndicator';
import { CardWithCount } from './types';

interface ActiveDeckProps {
  id: w.DeckId | null
  cards: w.CardInStore[]
  name: string

  isASet?: boolean  // otherwise, a deck
  // Only for decks:
  deck?: w.DeckInStore
  setForDeck?: w.Set
  // Only for sets:
  description?: string
  cardRarities?: Record<w.CardId, w.CardInSetRarity | undefined>

  loggedIn: boolean
  onIncreaseCardCount?: (cardId: w.CardId) => void  // for decks only
  onDecreaseCardCount?: (cardId: w.CardId) => void  // for decks only
  onUpdateCardRarities?: (cardRarities: Record<w.CardId, w.CardInSetRarity | undefined>) => void  // for sets only
  onRemoveCard: (cardId: w.CardId) => void
  onSave: (id: w.DeckId | null, name: string, cardIds: w.CardId[], description?: string) => void
}

interface ActiveDeckState {
  description: string
  name: string
  grouping: number
}

// Widget representing the deck or set currently being created or modified.
export default class ActiveDeck extends React.Component<ActiveDeckProps, ActiveDeckState> {
  public static defaultProps = {
    isASet: false
  };

  public state = {
    description: this.props.description || '',
    name: this.props.name,
    grouping: this.props.isASet ? 1 : 0
  };

  private styles: Record<string, React.CSSProperties> = {
    baseIcon: {
      fontSize: 36,
      padding: '10px 0',
      borderRadius: 3,
      boxShadow: '1px 1px 3px #CCC',
      cursor: 'pointer',
      width: '100%',
      textAlign: 'center'
    },
    cardGroupHeading: {
      fontWeight: 700,
      fontSize: 14,
      marginBottom: 10,
      marginTop: 10
    }
  };

  get hasRightCardCount(): boolean {
    const { cards, isASet } = this.props;
    if (isASet) {
      return cards.length >= 20;
    } else {
      return cards.length === 30;
    }
  }

  get hasRaritiesEnabled(): boolean {
    const { cardRarities, isASet } = this.props;
    return !!isASet && Object.values(cardRarities || {}).some(identity);
  }

  public UNSAFE_componentWillReceiveProps(nextProps: ActiveDeckProps): void {
    if (nextProps.name !== this.state.name) {
      this.setState({ name: nextProps.name });
    }

    if (nextProps.description !== this.state.description) {
      this.setState({ description: nextProps.description || '' });
    }
  }

  public render(): JSX.Element {
    const { cards, isASet, deck, setForDeck } = this.props;
    const { description, name } = this.state;

    return (
      <div>
        <div
          style={{
            fontWeight: 100,
            fontSize: 26,
            marginBottom: 5,
          }}
        >
          {isASet ? 'Set' : 'Deck'} [{' '}
          <span style={{ color: this.hasRightCardCount ? 'green' : 'red' }}>
            {cards.length}
          </span>
          {' '}/{' '}
          {
            isASet ?
              <span>
                20 ]
                <Tooltip
                  inline
                  className="help-tooltip"
                  place="left"
                  text="20 cards is the bare minimum for a set, but we recommend including at least 30 cards in a set to give players enough variety to build decks."
                >
                  <sup>
                    <Icon className="material-icons">help</Icon>
                  </sup>
                </Tooltip>
              </span> :
              '30 ]'
          }
          {
            !isASet && (
              <div style={{ float: 'right' }}>
                <DeckValidationIndicator hideNumCards cards={cards} deck={deck} set={setForDeck} />
              </div>
            )
          }
        </div>

        {this.hasRaritiesEnabled && (
          <div style={{ marginBottom: 5 }}>
            <RaritySymbol rarity="rare" />
            <span style={{ color: this.getNumCardsWithRarity('rare') < 4 ? 'red' : undefined }}>{this.getNumCardsWithRarity('rare')}</span>
            &nbsp;&nbsp;&nbsp;
            <RaritySymbol rarity="uncommon" />
            <span style={{ color: this.getNumCardsWithRarity('uncommon') < 4 ? 'red' : undefined }}>{this.getNumCardsWithRarity('uncommon')}</span>
            &nbsp;&nbsp;&nbsp;
            <RaritySymbol rarity="common" />
            <span style={{ color: this.getNumCardsWithRarity('common') < 4 ? 'red' : undefined }}>{this.getNumCardsWithRarity('common')}</span>

            <Tooltip
              inline
              className="help-tooltip"
              place="left"
              text="Sets with card rarities enabled must have at least 4 cards of each rarity (rare, uncommon, common)."
            >
              <Icon className="material-icons" style={{ fontSize: 20, position: 'relative', top: 3, left: 10 }}>help</Icon>
            </Tooltip>
          </div>
        )}

        <TextField
          value={name}
          label={`${isASet ? 'Set' : 'Deck'} name`}
          style={{ width: '100%', marginBottom: 10 }}
          onChange={this.handleChangeName}
        />

        {isASet && <TextField
          value={description}
          label="Description"
          style={{ width: '100%', marginBottom: 10 }}
          onChange={this.handleChangeDescription}
        />}

        {isASet && <FormControlLabel
          control={
            <Checkbox checked={this.hasRaritiesEnabled} onChange={this.handleToggleRaritiesEnabled} color="secondary" />
          }
          label={
            <span>
              Enable card rarities
              <Tooltip
                inline
                html
                className="help-tooltip"
                place="left"
                text="By default, all cards come up with equal probability when drafting a set.<br><br>Enabling the *card rarities* feature for a set makes some cards appear more rarely than others. On average, each drafted deck will get:<br>• 2–4 rare (★) cards<br>• 6–8 uncommon (◆) cards<br>• 18–22 common (●) cards"
              >
                <Icon className="material-icons" style={{ fontSize: 20, position: 'relative', top: 3, left: 8 }}>help</Icon>
              </Tooltip>
            </span>
          }
        />}

        {
          setForDeck &&
          <TextField
            disabled
            label="For the set:"
            value={`${setForDeck.name} by ${setForDeck.metadata.authorName}`}
            style={{ width: '100%', marginBottom: 10 }}
          />
        }

        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 20
            }}
          >
            {this.renderButton(0, 'view_headline', 'Group by Cost')}
            {this.renderButton(1, 'view_agenda', 'Group by Type')}
          </div>
        </div>

        {
          cards.length > 0
            ? <React.Fragment>
              {this.renderSaveButton()}
              <div style={{ margin: '20px auto' }}>
                {this.renderCardList()}
              </div>
              {this.renderSaveButton()}
            </React.Fragment>
            : this.renderSaveButton()
        }
      </div>
    );
  }

  private handleChangeName = (e: React.SyntheticEvent<any>) => { this.setState({ name: e.currentTarget.value }); };
  private handleChangeDescription = (e: React.SyntheticEvent<any>) => { this.setState({ description: e.currentTarget.value }); };
  private handleGroupByCost = () => { this.setState({ grouping: 0 }); };
  private handleGroupByType = () => { this.setState({ grouping: 1 }); };

  private handleToggleRaritiesEnabled = () => {
    const { cards, onUpdateCardRarities } = this.props;
    if (this.hasRaritiesEnabled) {
      // If rarities are currently enabled, disable them by setting all card rarities to undefined.
      onUpdateCardRarities!(Object.fromEntries(cards.map((card) => [card.id, undefined])));
    } else {
      // Otherwise, enable rarities by setting all card rarities to "common".
      onUpdateCardRarities!(Object.fromEntries(cards.map((card) => [card.id, 'common'])));
    }
  }

  private handleSave = () => {
    const { id, cards, isASet, onSave } = this.props;
    const { description, name } = this.state;

    onSave(id, name, cards.map((c) => c.id), isASet ? description : undefined);
  }

  private renderSaveButton(): JSX.Element {
    const { isASet, loggedIn } = this.props;
    const { name } = this.state;

    return (
      <MustBeLoggedIn loggedIn={loggedIn}>
        <Button
          variant="contained"
          color="secondary"
          disabled={!name}
          style={{ width: '100%' }}
          onClick={this.handleSave}
        >
          <Icon className="material-icons">save</Icon>
          {`Save ${isASet ? 'Set' : 'Deck'}`}
        </Button>
      </MustBeLoggedIn>
    );
  }

  private renderButton(grouping: number, iconName: string, tooltip: string): JSX.Element {
    const selected = (this.state.grouping === grouping);
    const handleClick = [this.handleGroupByCost, this.handleGroupByType][grouping];

    return (
      <div style={{ width: '47.5%' }}>
        <Tooltip text={tooltip} place="top" style={{ zIndex: MAX_Z_INDEX }}>
          <Icon
            className="material-icons"
            style={{
              ...this.styles.baseIcon,
              color: selected ? 'white' : 'black',
              backgroundColor: selected ? '#F44336' : '#EEEEEE'
            }}
            onClick={handleClick}
          >
            {iconName}
          </Icon>
        </Tooltip>
      </div>
    );
  }

  private renderCard(card: CardWithCount, idx: number): JSX.Element {
    const {
      isASet, cardRarities,
      onIncreaseCardCount, onDecreaseCardCount, onRemoveCard, onUpdateCardRarities
    } = this.props;
    return (
      <div key={idx} style={{ position: 'relative' }}>
        <ActiveDeckCard
          card={card}
          showCount={!isASet}
          rarity={cardRarities?.[card.id]}
          onIncreaseCardCount={onIncreaseCardCount}
          onDecreaseCardCount={onDecreaseCardCount}
          onRemoveCard={onRemoveCard}
          onUpdateCardRarities={onUpdateCardRarities}
        />
      </div>
    );
  }

  private renderCardGroup(type: w.CardType): JSX.Element {
    return (
      <div>
        {sortBy(groupCards(selectType(this.props.cards, type)), ['cost', 'name']).map((card, idx) =>
          this.renderCard(card, idx)
        )}
      </div>
    );
  }

  private renderCardList(): JSX.Element {
    const { cards } = this.props;

    if (this.state.grouping === 0) {
      return (
        <div>
          {sortBy(groupCards(cards), ['cost', 'name']).map((card, idx) =>
            this.renderCard(card, idx)
          )}
        </div>
      );
    } else {
      return (
        <div>
          <div style={this.styles.cardGroupHeading}>
            Robots ({selectType(cards, TYPE_ROBOT).length})
          </div>
          {this.renderCardGroup(TYPE_ROBOT)}

          <div style={this.styles.cardGroupHeading}>
            Events ({selectType(cards, TYPE_EVENT).length})
          </div>
          {this.renderCardGroup(TYPE_EVENT)}

          <div style={this.styles.cardGroupHeading}>
            Structures ({selectType(cards, TYPE_STRUCTURE).length})
          </div>
          {this.renderCardGroup(TYPE_STRUCTURE)}
        </div>
      );
    }
  }

  private getNumCardsWithRarity(rarity: w.CardInSetRarity): number {
    return Object.values(this.props.cardRarities || {}).filter((r) => r === rarity).length;
  }
}
