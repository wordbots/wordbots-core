import * as React from 'react';
import { arrayOf, element, func, object, oneOfType, string } from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { unpackDeck } from '../../util/cards.ts';
import { BUILTIN_FORMATS } from '../../util/formats.ts';
import RouterDialog from '../RouterDialog';

import DeckPicker from './DeckPicker';
import FormatPicker from './FormatPicker';

export default class PreGameModal extends React.Component {
  static propTypes = {
    availableDecks: arrayOf(object).isRequired,
    cards: arrayOf(object).isRequired,
    format: object,
    options: object,
    mode: string.isRequired,
    startButtonText: string,
    title: string,
    gameName: string,

    children: oneOfType([element, arrayOf(element)]),
    history: object.isRequired,

    onStartGame: func.isRequired
  };

  static defaultProps = {
    options: {},
    startButtonText: 'Start Game'
  }

  state = {
    selectedDeckIdx: 0,
    selectedFormatIdx: 0,
    enteredPassword: '',
    isPasswordInvalid: false
  };

  get format() {
    const { format } = this.props;
    const { selectedFormatIdx } = this.state;
    return format || BUILTIN_FORMATS[selectedFormatIdx];
  }

  get validDecks() {
    const { availableDecks, cards } = this.props;
    return availableDecks.map(deck => unpackDeck(deck, cards)).filter(this.format.isDeckValid);
  }

  /* The currently selected deck, in its raw form. */
  get deck() {
    const { selectedDeckIdx } = this.state;
    return this.validDecks[selectedDeckIdx];
  }

  /* The currently selected deck, in a form ready to start a game with. */
  get deckForGame() {
    return unpackDeck(this.deck, this.props.cards);
  }

  get actions() {
    const { mode, gameName } = this.props;
    return [
      <Button
        key="cancel"
        variant="outlined"
        onClick={this.close}
        style={{ marginRight: 10 }}>
        Cancel
      </Button>,
      <Button
        key="start"
        variant="raised"
        color="secondary"
        disabled={gameName === '' && mode === 'host'}
        onClick={this.handleStartGame}>
        {this.props.startButtonText}
      </Button>
    ];
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

  handleSetPassword = (e) => {
    this.setState({
      enteredPassword: e.target.value,
      isPasswordInvalid: false
    });
  }

  handleStartGame = () => {
    const { options, onStartGame } = this.props;
    const { enteredPassword } = this.state;

    if (options.passwordToJoin && enteredPassword !== options.passwordToJoin) {
      this.setState({ isPasswordInvalid: true });
      return;
    }

    onStartGame(this.format.name, this.deckForGame);
    this.close();
  };

  render() {
    const { cards, children, format, options, history, mode, title } = this.props;
    const { enteredPassword, isPasswordInvalid, selectedDeckIdx, selectedFormatIdx } = this.state;

    return (
      <RouterDialog
        modal
        path={mode}
        title={title}
        history={history}
        style={{
          width: 450
        }}
        actions={this.actions}
      >
        {children}
        {format ? null : <FormatPicker
          selectedFormatIdx={selectedFormatIdx}
          onChooseFormat={this.handleChooseFormat}
        />}
        {options.passwordToJoin && <TextField
          key="passwordToJoin"
          error={!enteredPassword || isPasswordInvalid}
          helperText={
            enteredPassword === ''
              ? 'This game requires a password to join!'
              : (isPasswordInvalid ? 'Invalid password!' : '')
          }
          style={{ width: '100%', marginBottom: 10 }}
          value={enteredPassword}
          label="Game password"
          onChange={this.handleSetPassword} />}
        <DeckPicker
          cards={cards}
          availableDecks={this.validDecks}
          selectedDeckIdx={selectedDeckIdx}
          onChooseDeck={this.handleChooseDeck} />
      </RouterDialog>
    );
  }
}
