import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { History } from 'history';
import { compact, uniqBy } from 'lodash';
import * as React from 'react';

import * as w from '../../types';
import { getQueryString } from '../../util/browser';
import { deckIsBuiltin, sortDecks, unpackDeck } from '../../util/decks';
import { updateDeckLastUsedTimestamp } from '../../util/firebase';
import { BuiltinOnlyGameFormat, BUILTIN_FORMATS, EverythingDraftFormat, GameFormat, NormalGameFormat, SetDraftFormat, SetFormat } from '../../util/formats';
import RouterDialog from '../RouterDialog';

import DeckPicker from './DeckPicker';
import FormatPicker from './FormatPicker';

interface PreGameModalProps {
  availableDecks: w.DeckInStore[]
  cards: w.CardInStore[]
  sets: w.Set[]
  allCards?: w.CardInStore[]
  format?: GameFormat
  options?: w.GameOptions
  mode: 'casual' | 'host' | 'matchmaking' | 'practice'
  startButtonText?: string
  title: string
  gameName?: string
  children?: JSX.Element | JSX.Element[]
  onStartGame: (formatName: w.Format, deck: w.DeckInGame) => void
  history: History
}

interface PreGameModalState {
  selectedDeckId: w.DeckId | null
  selectedFormatName: string
  enteredPassword: string
  isPasswordInvalid: boolean
}

export default class PreGameModal extends React.Component<PreGameModalProps, PreGameModalState> {
  public state: PreGameModalState = {
    selectedDeckId: null,
    selectedFormatName: getQueryString(this.props.history, 'format') || (this.props.mode === 'practice' ? 'normal' : 'sharedDeck'),
    enteredPassword: '',
    isPasswordInvalid: false
  };

  // The passed-in format, if any, otherwise the currently selected format.
  get format(): GameFormat {
    const { format } = this.props;
    const { selectedFormatName } = this.state;
    const formats = this.availableFormats;

    return format || formats.find((f) => f.name === selectedFormatName) || formats[0];
  }

  // "Private" (unpublished) set draft format if passed in through URL, otherwise undefined
  // Note that the only way that players can draft an unpublished set is through this "magic URL" method.
  get privateSetDraftFormatFromUrl(): GameFormat | undefined {
    const formatNameFromUrl = getQueryString(this.props.history, 'format');
    const allPossibleSetDraftFormats = this.props.sets.map((set) => new SetDraftFormat(set));
    return allPossibleSetDraftFormats.find((f) => f.name === formatNameFromUrl && !f.set.metadata.isPublished);
  }

  // The full list of formats that are available to the player (given the game mode).
  get availableFormats(): GameFormat[] {
    const { mode, sets, allCards } = this.props;

    if (mode === 'practice') {
      // Only "anything goes" (normal) and built-in format allowed in practice mode,
      // because the AI can't deal with arbitrary player cards.
      return [NormalGameFormat, BuiltinOnlyGameFormat];
    } else if (mode === 'matchmaking') {
      // Disallow set formats in matchmaking mode, because it's unlikely that those players would get matched.
      return BUILTIN_FORMATS;
    } else {
      const setFormats = uniqBy(compact(this.decks.map((deck) => {
        const set = sets.find((s) => s.id === deck.setId);
        if (set) {
          const setFormat = new SetFormat(set);
          if (setFormat.isDeckValid(deck)) {
            return setFormat;
          }
        }
      })), 'name');

      const setDraftFormats = sets.filter((set) => set.metadata.isPublished).map((set) => new SetDraftFormat(set));

      return compact([
        ...BUILTIN_FORMATS,
        ...setFormats,
        ...setDraftFormats,
        this.privateSetDraftFormatFromUrl,
        allCards ? new EverythingDraftFormat(allCards) : undefined
      ]);
    }
  }

  get noDeckRequired(): boolean {
    return !this.format.requiresDeck;
  }

  // All of the player's decks, in an unpacked format ready to start the game with.
  get decks(): w.DeckInGame[] {
    const { availableDecks, cards, sets } = this.props;
    return sortDecks(availableDecks.map((deck) => unpackDeck(deck, cards, sets)));
  }

  get validDecks(): w.DeckInGame[] {
    return this.decks.filter(this.format.isDeckValid);
  }

  // The currently selected deck, in unpacked form.
  get deck(): w.DeckInGame | null {
    const { selectedDeckId } = this.state;
    if (this.validDecks) {
      return this.validDecks.find((d) => d.id === selectedDeckId) || this.validDecks[0];
    } else {
      return null;
    }
  }

  get actions(): JSX.Element[] {
    const { mode, gameName } = this.props;
    return [
      (
        <Button
          key="cancel"
          variant="outlined"
          onClick={this.close}
          style={{ marginRight: 10 }}
        >
          Cancel
        </Button>
      ),
      (
        <Button
          key="start"
          variant="contained"
          color="primary"
          disabled={gameName === '' && mode === 'host'}
          onClick={this.handleStartGame}
        >
          {this.props.startButtonText || 'Start Game'}
        </Button>
      )
    ];
  }

  get options(): w.GameOptions {
    return this.props.options || {};
  }

  public render(): JSX.Element {
    const { cards, sets, children, format, history, mode, title } = this.props;
    const { enteredPassword, isPasswordInvalid, selectedFormatName } = this.state;

    return (
      <RouterDialog
        path={mode}
        title={title}
        history={history}
        style={{ width: 450 }}
        actions={this.actions}
      >
        <div>
          {children}
          {format
            ? <div><b>Format:</b> {format.rendered()}</div>
            : <FormatPicker
              availableFormats={this.availableFormats}
              selectedFormatName={selectedFormatName}
              onChooseFormat={this.handleChooseFormat}
            />
          }
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
            onChange={this.handleSetPassword}
          />}
          {!this.noDeckRequired && <DeckPicker
            cards={cards}
            availableDecks={this.validDecks}
            sets={sets}
            selectedDeck={this.deck}
            onChooseDeck={this.handleChooseDeck}
          />}
        </div>
      </RouterDialog>
    );
  }

  private close = () => {
    RouterDialog.closeDialog(this.props.history);
  }

  private handleChooseFormat = (selectedFormatName: string) => {
    this.setState({
      selectedFormatName,
      selectedDeckId: this.validDecks[0]?.id || null
    });
  }

  private handleChooseDeck = (deck: w.DeckInStore) => {
    this.setState({ selectedDeckId: deck.id });
    if (!deckIsBuiltin(deck)) {
      updateDeckLastUsedTimestamp(deck.id);
    }
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

    if (this.noDeckRequired) {
      const dummyDeck: w.DeckInGame = { id: 'na', authorId: 'na', name: 'na', cardIds: [], cards: [], setId: null };
      onStartGame(this.format.serialized(), dummyDeck);
      this.close();
    } else if (this.deck) {
      onStartGame(this.format.serialized(), this.deck);
      this.close();
    }
  }
}
