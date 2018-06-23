import * as React from 'react';
import { arrayOf, func, number, object } from 'prop-types';
import Paper from 'material-ui/Paper';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

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

  handleSelectDeck = (e, idx, v) => {
    this.props.onChooseDeck(idx);
  }

  render() {
    return (
      <Paper style={{display: 'flex', flex: 3, padding: 20, marginBottom: 20, marginRight: 20}}>
        <SelectField
          value={this.props.selectedDeckIdx}
          floatingLabelText="Choose a deck"
          style={{flex: 2, width: '80%', marginRight: 25}}
          onChange={this.handleSelectDeck}
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
