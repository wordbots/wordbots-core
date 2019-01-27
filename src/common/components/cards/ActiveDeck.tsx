import * as React from 'react';
import FontIcon from 'material-ui/FontIcon';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { sortBy } from 'lodash';

import * as w from '../../types';
import { MAX_Z_INDEX } from '../../constants';
import { groupCards, selectType } from '../../util/cards';
import Tooltip from '../Tooltip';
import MustBeLoggedIn from '../users/MustBeLoggedIn';

import { CardWithCount } from './types';
import ActiveDeckCard from './ActiveDeckCard';

interface ActiveDeckProps {
  id: w.DeckId | null
  cards: w.CardInStore[]
  name: string
  isASet?: boolean
  loggedIn: boolean
  onIncreaseCardCount?: (cardId: w.CardId) => void
  onDecreaseCardCount?: (cardId: w.CardId) => void
  onRemoveCard: (cardId: w.CardId) => void
  onSave: (id: w.DeckId | null, name: string, cardIds: w.CardId[]) => void
}

interface ActiveDeckState {
  name: string
  grouping: number
}

// Widget representing the deck or set currently being created or modified.
export default class ActiveDeck extends React.Component<ActiveDeckProps, ActiveDeckState> {
  public static defaultProps = {
    isASet: false
  };

  public state = {
    name: this.props.name,
    grouping: 0
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
    return (
      <div>
        <div style={{
          fontWeight: 100,
          fontSize: 28
        }}>
          {this.props.isASet ? 'Set' : 'Deck'} [
          <span style={{color: this.hasRightCardCount ? 'green' : 'red'}}>
            &nbsp;{this.props.cards.length}&nbsp;
          </span>
          / {this.props.isASet ? '15' : '30'} ]
        </div>

        <TextField
          value={this.state.name}
          floatingLabelText={`${this.props.isASet ? 'Set' : 'Deck'} name`}
          style={{width: '100%', marginBottom: 10}}
          onChange={this.handleChangeName} />

        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 20
          }}>
            {this.renderButton(0, 'view_headline', 'Group by Cost')}
            {this.renderButton(1, 'view_agenda', 'Group by Type')}
          </div>
        </div>

        {this.renderCardList()}

        <MustBeLoggedIn loggedIn={this.props.loggedIn}>
          <RaisedButton
            label={`Save ${this.props.isASet ? 'Set' : 'Deck'}`}
            labelPosition="before"
            secondary
            disabled={!this.state.name}
            icon={<FontIcon className="material-icons">save</FontIcon>}
            style={{width: '100%', marginTop: 20}}
            onClick={this.handleSave}
          />
        </MustBeLoggedIn>
      </div>
    );
  }

  private handleChangeName = (e: React.SyntheticEvent<any>) => { this.setState({name: e.currentTarget.value}); };
  private handleGroupByCost = () => { this.setState({grouping: 0}); };
  private handleGroupByType = () => { this.setState({grouping: 1}); };

  private handleSave = () => {
    const { id, cards, onSave } = this.props;
    onSave(id, this.state.name, cards.map((c) => c.id));
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
          onRemoveCard={this.props.onRemoveCard} />
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
    if (this.state.grouping === 0) {
      return (
        <div>
          {sortBy(groupCards(this.props.cards), ['cost', 'name']).map((card, idx) =>
            this.renderCard(card, idx)
          )}
        </div>
      );
    } else {
      return (
        <div>
          <div style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 10
          }}>Robots</div>

          {this.renderCardGroup(0)}

          <div style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 10,
            marginTop: 10
          }}>Events</div>

          {this.renderCardGroup(1)}

          <div style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 10,
            marginTop: 10
          }}>Structures</div>

          {this.renderCardGroup(3)}
        </div>
      );
    }
  }
}
