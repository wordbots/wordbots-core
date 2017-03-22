import React, { Component } from 'react';
import FontIcon from 'material-ui/lib/font-icon';
import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';

// Widget representing the deck currently being created or modified.
class ActiveDeck extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: props.name
    };
  }

  render() {
    return (
      <div>
        <div style={{
          fontWeight: 100,
          fontSize: 28
        }}>
          Deck&nbsp;
          <span style={{color: (this.props.cards.length === 30) ? 'green' : 'red'}}>
            [{this.props.cards.length}]
          </span>
        </div>

        <TextField
          value={this.state.name}
          floatingLabelText="Deck Name"
          style={{width: '100%', marginBottom: 10}}
          onChange={e => { this.setState({name: e.target.value}); }} />

        {this.props.cards.map((card, idx) =>
          <div
            key={idx}
            style={{cursor: 'pointer'}}
            onClick={() => this.props.onCardClick(idx)}>
            [x] {card.name}
          </div>
        )}

        <RaisedButton
          label="Save Deck"
          labelPosition="before"
          secondary
          disabled={this.state.name === '' /*|| this.props.cards.length !== 30*/}
          icon={<FontIcon className="material-icons">save</FontIcon>}
          style={{width: '100%', marginTop: 20}}
          onClick={() => { this.props.onSaveDeck(this.props.id, this.state.name, this.props.cards.map(c => c.id)); }}
        />
      </div>
    );
  }
}

const { array, func, string } = React.PropTypes;

ActiveDeck.propTypes = {
  id: string,
  cards: array,
  name: string,

  onCardClick: func,
  onSaveDeck: func
};

export default ActiveDeck;
