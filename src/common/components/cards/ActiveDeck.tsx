import { sortBy } from 'lodash';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import * as React from 'react';

import { MAX_Z_INDEX, TYPE_EVENT, TYPE_ROBOT, TYPE_STRUCTURE } from '../../constants';
import * as w from '../../types';
import { groupCards, selectType } from '../../util/cards';
import Tooltip from '../Tooltip';
import MustBeLoggedIn from '../users/MustBeLoggedIn';

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

  loggedIn: boolean
  onIncreaseCardCount?: (cardId: w.CardId) => void
  onDecreaseCardCount?: (cardId: w.CardId) => void
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
      padding: 10,
      borderRadius: 3,
      boxShadow: '1px 1px 3px #CCC',
      cursor: 'pointer',
      width: '100%',
      boxSizing: 'border-box',
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
      return cards.length >= 15;
    } else {
      return cards.length === 30;
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
            fontSize: 28
          }}
        >
          {isASet ? 'Set' : 'Deck'} [
          <span style={{color: this.hasRightCardCount ? 'green' : 'red'}}>
            &nbsp;{cards.length}&nbsp;
          </span>
          /{' '}
          {
            isASet ?
              <span>
                at least 15
                <Tooltip
                  inline
                  className="help-tooltip"
                  place="left"
                  text="15 cards is the bare minimum for a set, but we recommend including at least 30 cards in a set to give players enough variety to build decks."
                >
                  <sup>
                    <FontIcon className="material-icons" style={this.styles.helpIcon}>help</FontIcon>
                  </sup>
                </Tooltip>
              </span> :
              '30 '
          }
          ]
          {
            !isASet && (
              <div style={{ float: 'right' }}>
                <DeckValidationIndicator hideNumCards cards={cards} deck={deck} set={setForDeck}  />
              </div>
            )
          }
        </div>

        <TextField
          value={name}
          floatingLabelText={`${isASet ? 'Set' : 'Deck'} name`}
          style={{width: '100%', marginBottom: 10}}
          onChange={this.handleChangeName}
        />

        {isASet && <TextField
          value={description}
          floatingLabelText="Description"
          style={{width: '100%', marginBottom: 10}}
          onChange={this.handleChangeDescription}
        />}

        {
          setForDeck &&
            <TextField
              disabled
              floatingLabelText="For the set:"
              value={`${setForDeck.name} by ${setForDeck.metadata.authorName}`}
              style={{width: '100%', marginBottom: 10, marginTop: -20}}
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

        {this.renderSaveButton({ marginBottom: 20 })}
        {this.renderCardList()}
        {this.renderSaveButton({ marginTop: 20 })}
      </div>
    );
  }

  private handleChangeName = (e: React.SyntheticEvent<any>) => { this.setState({name: e.currentTarget.value}); };
  private handleChangeDescription = (e: React.SyntheticEvent<any>) => { this.setState({description: e.currentTarget.value}); };
  private handleGroupByCost = () => { this.setState({grouping: 0}); };
  private handleGroupByType = () => { this.setState({grouping: 1}); };

  private handleSave = () => {
    const { id, cards, isASet, onSave } = this.props;
    const { description, name } = this.state;

    onSave(id, name, cards.map((c) => c.id), isASet ? description : undefined);
  }

  private renderSaveButton(style: React.CSSProperties = {}): JSX.Element {
    const { isASet, loggedIn } = this.props;
    const { name } = this.state;

    return (
      <MustBeLoggedIn loggedIn={loggedIn}>
        <RaisedButton
          label={`Save ${isASet ? 'Set' : 'Deck'}`}
          labelPosition="before"
          secondary
          disabled={!name}
          icon={<FontIcon className="material-icons">save</FontIcon>}
          style={{ width: '100%', ...style }}
          onClick={this.handleSave}
        />
      </MustBeLoggedIn>
    );
  }

  private renderButton(grouping: number, iconName: string, tooltip: string): JSX.Element {
    const selected = (this.state.grouping === grouping);
    const handleClick = [this.handleGroupByCost, this.handleGroupByType][grouping];

    return (
      <div style={{width: '47.5%'}}>
        <Tooltip text={tooltip} place="top" style={{ zIndex: MAX_Z_INDEX }}>
          <FontIcon
            className="material-icons"
            style={{
              ...this.styles.baseIcon,
              color: selected ? 'white' : 'black',
              backgroundColor: selected ? '#F44336' : '#EEEEEE'
            }}
            onClick={handleClick}
          >
            {iconName}
          </FontIcon>
        </Tooltip>
      </div>
    );
  }

  private renderCard(card: CardWithCount, idx: number): JSX.Element {
    return (
      <div key={idx} style={{position: 'relative'}}>
        <ActiveDeckCard
          card={card}
          showCount={!this.props.isASet}
          onIncreaseCardCount={this.props.onIncreaseCardCount}
          onDecreaseCardCount={this.props.onDecreaseCardCount}
          onRemoveCard={this.props.onRemoveCard}
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
}
