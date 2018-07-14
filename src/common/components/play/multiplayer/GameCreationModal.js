import * as React from 'react';
import { arrayOf, func, object, string } from 'prop-types';
import TextField from '@material-ui/core/TextField';

import PreGameModal from '../PreGameModal';

export default class GameCreationModal extends React.Component {
  static propTypes = {
    availableDecks: arrayOf(object).isRequired,
    cards: arrayOf(object).isRequired,
    path: string.isRequired,
    title: string,

    history: object.isRequired,

    onCreateGame: func.isRequired
  };

  state = {
    gameName: ''
  };

  handleSetGameName = (e) => {
    this.setState({ gameName: e.target.value });
  }

  handleCreateGame = (formatName, deck) => {
    this.props.onCreateGame(this.state.gameName, formatName, deck);
    this.setState({ gameName: '' });
  }

  render() {
    const { availableDecks, cards, history, path, title } = this.props;
    const isGameNameEmpty = this.state.gameName === '';

    return (
      <PreGameModal
        mode={path}
        title={title}
        availableDecks={availableDecks}
        cards={cards}
        history={history}
        onStartGame={this.handleCreateGame}
        gameName={this.state.gameName}
      >
        <TextField
          error={isGameNameEmpty}
          helperText={isGameNameEmpty ? 'The game name cannot be empty!' : ''}
          style={{ width: '100%', marginBottom: 15 }}
          value={this.state.gameName}
          label="Game Name"
          onChange={this.handleSetGameName} />
      </PreGameModal>
    );
  }
}
