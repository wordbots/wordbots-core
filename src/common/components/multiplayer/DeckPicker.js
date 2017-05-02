import React, { Component } from 'react';
import { array, number, func } from 'prop-types';
import Paper from 'material-ui/Paper';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import { cardsInDeck } from '../../util/cards';
import EnergyCurve from '../cards/EnergyCurve';

export default class DeckPicker extends Component {
  static propTypes = {
    cards: array,
    availableDecks: array,
    selectedDeckIdx: number,
    onChooseDeck: func
  };

  get noDecks() {
    return this.props.availableDecks.length === 0;
  }

  get cardsInDeck() {
    return this.noDecks ? [] : cardsInDeck(this.props.availableDecks[this.props.selectedDeckIdx], this.props.cards);
  }

  render() {
    return (
      <Paper style={{display: 'flex', padding: 20, marginBottom: 20}}>
        <SelectField
          value={this.props.selectedDeckIdx}
          floatingLabelText="Choose a deck"
          style={{flex: 2, width: '80%', marginRight: 25}}
          onChange={(e, idx, v) => { this.props.onChooseDeck(idx); }}
          disabled={this.noDecks}
          errorText={this.noDecks ? 'You don\'t have any complete (30-card) decks!' : null}
        >
          {this.props.availableDecks.map((deck, idx) =>
            <MenuItem key={idx} value={idx} primaryText={`${deck.name}`}/>
          )}
        </SelectField>

        <div style={{flex: 1}}>
          <EnergyCurve cards={this.cardsInDeck} height={80} />
        </div>
      </Paper>
    );
  }
}

