import React, { Component } from 'react';
import TextField from 'material-ui/lib/text-field';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Paper from 'material-ui/lib/paper';
import * as fetch from 'whatwg-fetch';

class CardCreationForm extends Component {
  constructor(props) {
    super(props);
  }

  createMenuItems(list) {
    return list.map((text, index) => {
      return (
        <MenuItem key={index} value={index} primaryText={text}/>
      );
    });
  }

  parseText(text) {
    let sentences = text.split(/[\\.!\?]/);
    let parsedSentences = [];

    sentences.forEach((sentence, index) => {
      fetch('https://wordbots.herokuapp.com/parse?input=[text]&format=js').then((response) => {
        let parsedResponse = JSON.parse(response);

        if (parsedResponse.error) {
          parsedSentences[index] = {
            valid: false,
            error: parsedResponse.erro,
            unrecognizedTokens: parsedResponse.unrecognizedTokens
          };
        } else {
          parsedSentences[index] = {
            valid: true,
            function: parsedResponse.function
          };
        }
      });
    });
  }

  render() {
    const cardTypes = ['Robot', 'Event', 'Kernel', 'Structure'];

    return (
      <div style={{width: '50%', padding: 64}}>
        <Paper style={{padding: 48}}>
          <TextField
            defaultValue={this.props.name}
            floatingLabelText="Card Name"
            style={{width: '100%'}}
            onChange={(e) => {
              this.props.onSetName(e.target.value);
            }}/>
          <SelectField
            value={this.props.type}
            floatingLabelText="Card Type"
            style={{width: '100%'}} 
            onChange={(e, index) => {
              this.props.onSetType(index);
            }}
          >
            {this.createMenuItems(cardTypes)}
          </SelectField>
        </Paper>
      </div>
    );
  }
}

CardCreationForm.propTypes = {
  name: React.PropTypes.string,
  type: React.PropTypes.number,

  onSetName: React.PropTypes.func,
  onSetType: React.PropTypes.func
};

export default CardCreationForm;
