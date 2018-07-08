import * as React from 'react';
import { arrayOf, func, object, string } from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';

import { shuffleCardsInDeck } from '../../util/cards';
import { FORMATS } from '../../store/gameFormats';
import RouterDialog from '../RouterDialog';

import DeckPicker from './DeckPicker';
import FormatPicker from './FormatPicker';

export default class PreGameModal extends React.Component {
  static propTypes = {
    availableDecks: arrayOf(object).isRequired,
    cards: arrayOf(object).isRequired,
    format: object,
    mode: string.isRequired,
    title: string,

    history: object.isRequired,

    onStartGame: func.isRequired
  };

  state = {
    selectedDeckIdx: 0,
    selectedFormatIdx: 0
  };

  get format() {
    const { format } = this.props;
    const { selectedFormatIdx } = this.state;
    return format || FORMATS[selectedFormatIdx];
  }

  get validDecks() {
    const { availableDecks } = this.props;
    return availableDecks.filter(this.format.isDeckValid);
  }

  /* The currently selected deck, in its raw form. */
  get deck() {
    const { selectedDeckIdx } = this.state;
    return this.validDecks[selectedDeckIdx];
  }

  /* The currently selected deck, in a form ready to start a game with. */
  get deckForGame() {
    const { cards } = this.props;
    const deck = this.deck;
    return { ...deck, cards: shuffleCardsInDeck(deck, cards) };
  }

  close = () => {
    RouterDialog.closeDialog(this.props.history);
  }

  handleChooseFormat = (selectedFormatIdx) => {
    this.setState({ selectedFormatIdx, selectedDeckIdx: 0 });
  }

  handleChooseDeck = (selectedDeckIdx) => {
    this.setState({ selectedDeckIdx });
  }

  handleStartGame = () => {
    this.props.onStartGame(this.format.name, this.deck);
    this.close();
  };

  render() {
    const { cards, format, history, mode, title } = this.props;
    const { selectedDeckIdx, selectedFormatIdx } = this.state;

    return (
      <RouterDialog
        modal
        path={mode}
        title={title}
        history={history}
        actions={[
          <RaisedButton
            label="Cancel"
            key="Cancel"
            onTouchTap={this.close}
            style={{ marginRight: 10 }} />,
          <RaisedButton
            secondary
            label="Start Game"
            key="Start Game"
            onTouchTap={this.handleStartGame} />
        ]}
      >
        {!format && <FormatPicker
          selectedFormatIdx={selectedFormatIdx}
          onChooseFormat={this.handleChooseFormat}
        />}
        <DeckPicker
          cards={cards}
          availableDecks={this.validDecks}
          selectedDeckIdx={selectedDeckIdx}
          onChooseDeck={this.handleChooseDeck} />
      </RouterDialog>
    );
  }
}
