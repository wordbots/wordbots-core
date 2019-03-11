import * as React from 'react';
import { History } from 'history';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import * as w from '../../types';
import { unpackDeck } from '../../util/cards';
import { BUILTIN_FORMATS, GameFormat } from '../../util/formats';
import RouterDialog from '../RouterDialog';

import DeckPicker from './DeckPicker';
import FormatPicker from './FormatPicker';

interface PreGameModalProps {
  availableDecks: w.DeckInStore[]
  cards: w.CardInStore[]
  sets: w.Set[]
  format?: GameFormat
  options?: w.GameOptions
  mode: string
  startButtonText?: string
  title: string
  gameName?: string
  children?: JSX.Element | JSX.Element[]
  onStartGame: (formatName: w.Format, deck: w.Deck) => void
  history: History
}

interface PreGameModalState {
  selectedDeckIdx: number
  selectedFormatIdx: number
  enteredPassword: string
  isPasswordInvalid: boolean
}

export default class PreGameModal extends React.Component<PreGameModalProps, PreGameModalState> {
  public state = {
    selectedDeckIdx: 0,
    selectedFormatIdx: 0,
    enteredPassword: '',
    isPasswordInvalid: false
  };

  get format(): GameFormat {
    const { format } = this.props;
    const { selectedFormatIdx } = this.state;
    return format || BUILTIN_FORMATS[selectedFormatIdx];
  }

  get validDecks(): w.DeckInStore[] {
    const { availableDecks, cards, sets } = this.props;
    return availableDecks.map((deck) => unpackDeck(deck, cards, sets)).filter(this.format.isDeckValid);
  }

  /* The currently selected deck, in its raw form. */
  get deck(): w.DeckInStore {
    const { selectedDeckIdx } = this.state;
    return this.validDecks[selectedDeckIdx];
  }

  /* The currently selected deck, in a form ready to start a game with. */
  get deckForGame(): w.Deck {
    const { cards, sets } = this.props;
    return unpackDeck(this.deck, cards, sets);
  }

  get actions(): JSX.Element[] {
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
        {this.props.startButtonText || 'Start Game'}
      </Button>
    ];
  }

  get options(): w.GameOptions {
    return this.props.options || {};
  }

  public render(): JSX.Element {
    const { cards, sets, children, format, history, mode, title } = this.props;
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
        {this.options.passwordToJoin && <TextField
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
          sets={sets}
          selectedDeckIdx={selectedDeckIdx}
          onChooseDeck={this.handleChooseDeck} />
      </RouterDialog>
    );
  }

  private close = () => {
    RouterDialog.closeDialog(this.props.history);
  }

  private handleChooseFormat = (selectedFormatIdx: number) => {
    this.setState({ selectedFormatIdx, selectedDeckIdx: 0 });
  }

  private handleChooseDeck = (selectedDeckIdx: number) => {
    this.setState({ selectedDeckIdx });
  }

  private handleSetPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      enteredPassword: e.currentTarget.value,
      isPasswordInvalid: false
    });
  }

  private handleStartGame = () => {
    const { onStartGame } = this.props;
    const { enteredPassword } = this.state;

    if (this.options.passwordToJoin && enteredPassword !== this.options.passwordToJoin) {
      this.setState({ isPasswordInvalid: true });
      return;
    }

    onStartGame(this.format.name as w.Format, this.deckForGame);
    this.close();
  }
}
