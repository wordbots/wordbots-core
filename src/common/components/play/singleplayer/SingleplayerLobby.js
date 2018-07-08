import * as React from 'react';
import { arrayOf, func, number, object } from 'prop-types';

import { shuffleCardsInDeck } from '../../../util/cards';
import { FORMATS } from '../../../store/gameFormats';
import DeckPicker from '../DeckPicker';
import FormatPicker from '../FormatPicker';

import SingleplayerModeSelection from './SingleplayerModeSelection';

export default class SingleplayerLobby extends React.Component {
  static propTypes = {
    availableDecks: arrayOf(object),
    cards: arrayOf(object),
    selectedDeckIdx: number,
    selectedFormatIdx: number,

    onSelectDeck: func,
    onSelectFormat: func,
    onSelectMode: func
  };

  get hasNoDecks() {
    return this.props.availableDecks.length === 0;
  }

  /* The currently selected deck, in its raw form. */
  get deck() {
    const { availableDecks, selectedDeckIdx } = this.props;
    return availableDecks[selectedDeckIdx];
  }

  /* The currently selected deck, in a form ready to start a game with. */
  get deckForGame() {
    const { cards } = this.props;
    const deck = this.deck;
    return { ...deck, cards: shuffleCardsInDeck(deck, cards) };
  }

  get format() {
    return FORMATS[this.props.selectedFormatIdx].name;
  }

  handleSelectFormat = (formatIdx) => {
    this.props.onSelectFormat(formatIdx);
    this.props.onSelectDeck(0);
  }

  handleSelectMode = (mode) => {
    if (mode === 'practice') {
      // If selecting practice mode, pass the deck and format into the URL.
      this.props.onSelectMode(mode, this.format, this.deckForGame);
    } else {
      this.props.onSelectMode(mode);
    }
  };

  render() {
    const {
      availableDecks, cards, selectedDeckIdx, selectedFormatIdx, onSelectDeck
    } = this.props;

    return (
      <div style={{padding: '48px 72px 0'}}>
        <div style={{display: 'flex'}}>
          <FormatPicker
            selectedFormatIdx={selectedFormatIdx}
            onChooseFormat={this.handleSelectFormat} />
          <DeckPicker
            cards={cards}
            availableDecks={availableDecks}
            selectedDeckIdx={selectedDeckIdx}
            onChooseDeck={onSelectDeck} />
        </div>

        <SingleplayerModeSelection />
      </div>
    );
  }
}
