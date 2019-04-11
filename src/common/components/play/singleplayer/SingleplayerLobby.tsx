import { History } from 'history';
import * as React from 'react';

import * as w from '../../../types';
import RouterDialog from '../../RouterDialog';
import Title from '../../Title';
import PreGameModal from '../PreGameModal';

import SingleplayerModeSelection from './SingleplayerModeSelection';

interface SingleplayerLobbyProps {
  availableDecks: w.DeckInStore[]
  cards: w.CardInStore[]
  sets: w.Set[]
  history: History
  onSelectMode: (modeStr: string, formatStr: w.Format | null, deck: w.DeckInStore | null) => void
}

export default class SingleplayerLobby extends React.Component<SingleplayerLobbyProps> {
  public render(): JSX.Element {
    const { availableDecks, cards, sets, history } = this.props;

    return (
      <div >
        <Title text="Singleplayer" />
        <div style={{ padding: 20 }}>
          <SingleplayerModeSelection onSelectMode={this.handleSelectMode} />
          <PreGameModal
            mode="practice"
            title="Start Practice Game"
            availableDecks={availableDecks}
            cards={cards}
            sets={sets}
            history={history}
            onStartGame={this.handleStartPracticeGame}
          />
        </div>
      </div>
    );
  }

  private handleSelectMode = (mode: string) => {
    if (mode === 'practice') {
      // Prompt the user for format & deck.
      RouterDialog.openDialog(this.props.history, 'practice');
    } else {
      this.props.onSelectMode(mode, null, null);
    }
  }

  private handleStartPracticeGame = (formatName: w.Format, deck: w.DeckInStore) => {
    this.props.onSelectMode('practice', formatName, deck);
  }
}
