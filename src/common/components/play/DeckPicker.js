import * as React from 'react';
import { arrayOf, func, number, object } from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import { cardsInDeck } from '../../util/cards';
import EnergyCurve from '../cards/EnergyCurve';

export default class DeckPicker extends React.Component {
  static propTypes = {
    cards: arrayOf(object),
    availableDecks: arrayOf(object),
    selectedDeckIdx: number,
    onChooseDeck: func
  };

  get noDecks() {
    return this.props.availableDecks.length === 0;
  }

  get cardsInDeck() {
    return this.noDecks ? [] : cardsInDeck(this.props.availableDecks[this.props.selectedDeckIdx], this.props.cards);
  }

  handleSelectDeck = (event) => {
    this.props.onChooseDeck(event.target.value);
  }

  render() {
    return (
      <React.Fragment>
        <FormControl style={{ width: '100%', marginBottom: 15 }} error={this.noDecks}>
          <InputLabel>Choose a deck</InputLabel>
          <Select
            style={{
              width: '100%', 
              marginRight: 25
            }}
            name="decks"
            value={this.props.selectedDeckIdx}
            onChange={this.handleSelectDeck}
            disabled={this.noDecks}
          >
            {this.props.availableDecks.map((deck, idx) =>
              <MenuItem key={idx} value={idx}>{deck.name}</MenuItem>
            )}
          </Select>
          <FormHelperText style={{
            display: this.noDecks ? 'none' : 'none'
          }}>You don&#39;t have any complete (30-card) decks</FormHelperText>
        </FormControl>
        <EnergyCurve cards={this.cardsInDeck} height={80} />
      </React.Fragment>
    );
  }
}
