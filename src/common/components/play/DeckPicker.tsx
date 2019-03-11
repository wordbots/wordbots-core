import * as React from 'react';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import * as w from '../../types';
import { cardsInDeck } from '../../util/cards';
import { sortDecks } from '../../util/decks';
import EnergyCurve from '../cards/EnergyCurve';

interface DeckPickerProps {
  cards: w.CardInStore[]
  availableDecks: w.DeckInStore[]
  sets: w.Set[]
  selectedDeckIdx: number
  onChooseDeck: (deckIdx: number) => void
}

export default class DeckPicker extends React.Component<DeckPickerProps> {
  get noDecks(): boolean {
    return this.props.availableDecks.length === 0;
  }

  get cardsInDeck(): w.CardInStore[] {
    const { availableDecks, selectedDeckIdx, cards, sets } = this.props;
    return this.noDecks ? [] : cardsInDeck(availableDecks[selectedDeckIdx], cards, sets);
  }

  public render(): JSX.Element {
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
            {sortDecks(this.props.availableDecks).map((deck, idx) =>
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

  private handleSelectDeck = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.onChooseDeck(parseInt(event.target.value, 10));
  }
}
