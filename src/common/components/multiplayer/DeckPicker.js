import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

class DeckPicker extends Component {
  render() {
    return (
      <Paper style={{padding: 20, marginBottom: 20}}>
        <SelectField
          value={this.props.selectedDeckIdx}
          floatingLabelText="Choose a deck"
          style={{width: '80%', marginRight: 25}}
          onChange={(e, idx, v) => { this.props.onChooseDeck(idx); }}>
          {this.props.availableDecks.map((deck, idx) =>
            <MenuItem key={idx} value={idx} primaryText={`${deck.name} (${deck.cards.length} cards)`}/>
          )}
        </SelectField>
      </Paper>
    );
  }
}

const { array, number, func } = React.PropTypes;

DeckPicker.propTypes = {
  availableDecks: array,
  selectedDeckIdx: number,
  onChooseDeck: func
};

export default DeckPicker;
