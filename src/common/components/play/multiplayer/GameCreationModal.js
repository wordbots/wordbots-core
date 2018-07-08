import * as React from 'react';
import { arrayOf, func, object, string } from 'prop-types';
import TextField from 'material-ui/TextField';

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
  }

  render() {
    const { availableDecks, cards, history, path, title } = this.props;

    return (
      <PreGameModal
        mode={path}
        title={title}
        availableDecks={availableDecks}
        cards={cards}
        history={history}
        onStartGame={this.handleCreateGame}
      >
        <TextField
          value={this.state.gameName}
          floatingLabelText="Game Name"
          onChange={this.handleSetGameName} />
      </PreGameModal>
    );
  }
}
