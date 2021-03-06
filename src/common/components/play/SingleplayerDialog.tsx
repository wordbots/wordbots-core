import { Button } from '@material-ui/core';
import { History } from 'history';
import * as React from 'react';

import * as w from '../../types';
import RouterDialog from '../RouterDialog';

import PreGameModal from './PreGameModal';
import SingleplayerModeSelection from './SingleplayerModeSelection';

interface SingleplayerDialogProps {
  availableDecks: w.DeckInStore[]
  cards: w.CardInStore[]
  history: History
  onSelectMode: (modeStr: string, formatStr: w.BuiltInFormat | null, deck: w.DeckInStore | null) => void
}

export default class SingleplayerDialog extends React.Component<SingleplayerDialogProps> {
  public render(): JSX.Element {
    const { availableDecks, cards, history } = this.props;

    return (
      <React.Fragment>
        <RouterDialog
          path="singleplayer"
          history={history}
          actions={this.actions}
          style={{ width: 600 }}
          actionsStyle={{ marginTop: -20 }}
        >
          <SingleplayerModeSelection onSelectMode={this.handleSelectMode} />
        </RouterDialog>
        <PreGameModal
          mode="practice"
          title="Start Practice Game"
          availableDecks={availableDecks}
          cards={cards}
          sets={[]/* we don't support set formats in practice games */}
          history={history}
          onStartGame={this.handleStartPracticeGame}
        />
      </React.Fragment>
    );
  }

  get actions(): JSX.Element[] {
    return [
      (
        <Button
          key="close"
          variant="outlined"
          onClick={this.handleClose}
        >
          Close
        </Button>
      )
    ];
  }

  private handleClose = () => {
    RouterDialog.closeDialog(this.props.history);
  }

  private handleSelectMode = (mode: string) => {
    if (mode === 'practice') {
      // Prompt the user for format & deck.
      RouterDialog.openDialog(this.props.history, 'practice');
    } else {
      this.props.onSelectMode(mode, null, null);
    }
  }

  private handleStartPracticeGame = (format: w.Format, deck: w.DeckInStore) => {
    this.props.onSelectMode('practice', format as w.BuiltInFormat, deck);
  }
}
