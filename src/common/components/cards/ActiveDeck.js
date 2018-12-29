import * as React from 'react';
import { arrayOf, bool, func, object, string } from 'prop-types';
import FontIcon from 'material-ui/FontIcon';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { sortBy } from 'lodash';

import { MAX_Z_INDEX } from '../../constants.ts';
import { groupCards, selectType } from '../../util/cards.ts';
import Tooltip from '../Tooltip';
import MustBeLoggedIn from '../users/MustBeLoggedIn';

import ActiveDeckCard from './ActiveDeckCard';

// Widget representing the deck currently being created or modified.
export default class ActiveDeck extends React.Component {
  static propTypes = {
    id: string,
    cards: arrayOf(object),
    name: string,
    loggedIn: bool,

    onIncreaseCardCount: func,
    onDecreaseCardCount: func,
    onRemoveCard: func,
    onSaveDeck: func
  }

  state = {
    name: this.props.name,
    grouping: 0
  };

  styles = {
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

  handleChangeName = (e) => { this.setState({name: e.target.value}); };
  handleGroupByCost = () => { this.setState({grouping: 0}); };
  handleGroupByType = () => { this.setState({grouping: 1}); };

  handleSaveDeck = () => {
    const { id, cards, onSaveDeck } = this.props;
    onSaveDeck(id, this.state.name, cards.map(c => c.id));
  }

  renderButton(grouping, iconName, tooltip) {
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

  renderCard(card, idx) {
    return (
      <div key={idx} style={{position: 'relative'}}>
        <ActiveDeckCard
          card={card}
          onIncreaseCardCount={this.props.onIncreaseCardCount}
          onDecreaseCardCount={this.props.onDecreaseCardCount}
          onRemoveCard={this.props.onRemoveCard} />
      </div>
    );
  }

  renderCardGroup(type) {
    return (
      <div>
        {sortBy(groupCards(selectType(this.props.cards, type)), ['cost', 'name']).map((card, idx) =>
          this.renderCard(card, idx)
        )}
      </div>
    );
  }

  renderCardList() {
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

  render() {
    return (
      <div>
        <div style={{
          fontWeight: 100,
          fontSize: 28
        }}>
          Deck [
          <span style={{color: (this.props.cards.length === 30) ? 'green' : 'red'}}>
            &nbsp;{this.props.cards.length}&nbsp;
          </span>
          / 30 ]
        </div>

        <TextField
          value={this.state.name}
          floatingLabelText="Deck Name"
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
            label="Save Deck"
            labelPosition="before"
            secondary
            disabled={!this.state.name}
            icon={<FontIcon className="material-icons">save</FontIcon>}
            style={{width: '100%', marginTop: 20}}
            onClick={this.handleSaveDeck}
          />
        </MustBeLoggedIn>
      </div>
    );
  }
}
