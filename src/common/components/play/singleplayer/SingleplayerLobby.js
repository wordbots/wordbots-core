import * as React from 'react';
import { arrayOf, func, object } from 'prop-types';

import Title from '../../Title';
import RouterDialog from '../../RouterDialog.tsx';
import PreGameModal from '../PreGameModal';

import SingleplayerModeSelection from './SingleplayerModeSelection';

export default class SingleplayerLobby extends React.Component {
  static propTypes = {
    availableDecks: arrayOf(object),
    cards: arrayOf(object),
    sets: arrayOf(object),

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
            onStartGame={this.handleStartPracticeGame} />
        </div>
      </div>
    );
  }
}
