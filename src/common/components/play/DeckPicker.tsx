import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import * as React from 'react';

import * as w from '../../types';
import { cardsInDeck } from '../../util/decks';
import EnergyCurve from '../cards/EnergyCurve';

interface DeckPickerProps {
  cards: w.CardInStore[]
  availableDecks: w.DeckInStore[]
  sets: w.Set[]
  selectedDeck: w.DeckInStore | null
  onChooseDeck: (deck: w.DeckInStore) => void
}

export default class DeckPicker extends React.Component<DeckPickerProps> {
  get noDecks(): boolean {
    return this.props.availableDecks.length === 0;
  }

  get cardsInDeck(): w.CardInStore[] {
    const { selectedDeck, cards, sets } = this.props;
    return selectedDeck ? cardsInDeck(selectedDeck, cards, sets) : [];
  }

  public render(): JSX.Element {
    const { availableDecks, selectedDeck } = this.props;
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
            value={selectedDeck ? selectedDeck.id : undefined}
            onChange={this.handleSelectDeck}
            disabled={this.noDecks}
          >
            {availableDecks.map((deck, idx) =>
              <MenuItem key={idx} value={deck.id}>{deck.name}</MenuItem>
            )}
          </Select>
        </FormControl>
        <EnergyCurve cards={this.cardsInDeck} height={80} />
      </React.Fragment>
    );
  }

  private handleSelectDeck = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { availableDecks, onChooseDeck } = this.props;
    const selectedDeck: w.DeckInStore = availableDecks.find((deck) => deck.id === event.target.value)!;
    onChooseDeck(selectedDeck);
  }
}
