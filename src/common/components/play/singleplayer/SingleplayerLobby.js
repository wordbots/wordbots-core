import * as React from 'react';
import { arrayOf, func, object } from 'prop-types';

import RouterDialog from '../../RouterDialog';
import PreGameModal from '../PreGameModal';

import SingleplayerModeSelection from './SingleplayerModeSelection';

export default class SingleplayerLobby extends React.Component {
  static propTypes = {
    availableDecks: arrayOf(object),
    cards: arrayOf(object),

    history: object,

    onSelectMode: func
  };

  handleSelectMode = (mode) => {
    if (mode === 'practice') {
      // Prompt the user for format & deck.
      RouterDialog.openDialog(this.props.history, 'practice');
    } else {
      this.props.onSelectMode(mode);
    }
  };

  handleStartPracticeGame = (formatName, deck) => {
    this.props.onSelectMode('practice', formatName, deck);
  }

  render() {
    const { availableDecks, cards, history } = this.props;

    return (
      <div style={{padding: '48px 72px 0'}}>
        <SingleplayerModeSelection onSelectMode={this.handleSelectMode} />
        <PreGameModal
          mode="practice"
          title="Start Practice Game"
          availableDecks={availableDecks}
          cards={cards}
          history={history}
          onStartGame={this.handleStartPracticeGame} />
      </div>
    );
  }
}
