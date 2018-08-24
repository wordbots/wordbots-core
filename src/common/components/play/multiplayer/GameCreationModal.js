import * as React from 'react';
import { arrayOf, func, object, string } from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
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
    gameName: '',
    options: {
      disableTurnTimer: false,
      passwordToJoin: null
    }
  };

  handleSetGameName = (e) => {
    this.setState({ gameName: e.target.value });
  }

  handleSetPassword = (e) => {
    const passwordToJoin = e.target.value || null;
    this.setState(state => ({
      options: { ...state.options, passwordToJoin }
    }));
  }

  handleSetDisableTurnTimer = (e) => {
    const disableTurnTimer = e.target.checked;
    this.setState(state => ({
      options: { ...state.options, disableTurnTimer }
    }));
  }

  handleCreateGame = (formatName, deck) => {
    const { gameName, options } = this.state;
    this.props.onCreateGame(gameName, formatName, deck, options);
    this.setState({ gameName: '' });
  }

  render() {
    const { availableDecks, cards, history, path, title } = this.props;
    const { gameName, options: { disableTurnTimer, passwordToJoin } } = this.state;

    return (
      <PreGameModal
        mode={path}
        title={title}
        availableDecks={availableDecks}
        cards={cards}
        history={history}
        onStartGame={this.handleCreateGame}
        gameName={gameName}
      >
        <TextField
          error={gameName === ''}
          helperText={gameName === '' ? 'The game name cannot be empty!' : ''}
          style={{ width: '100%' }}
          value={gameName}
          label="Game Name"
          onChange={this.handleSetGameName} />
        <TextField
          style={{ width: '100%', marginBottom: 10 }}
          value={passwordToJoin}
          label="Password to join (empty = no password)"
          onChange={this.handleSetPassword} />
        <FormControlLabel
          control={
            <Checkbox
              checked={disableTurnTimer}
              onChange={this.handleSetDisableTurnTimer}
            />
          }
          label="Disable Turn Timer?"
        />
      </PreGameModal>
    );
  }
}
