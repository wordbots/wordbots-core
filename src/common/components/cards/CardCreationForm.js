import React, { Component } from 'react';
import TextField from 'material-ui/lib/text-field';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Paper from 'material-ui/lib/paper';
/* eslint-disable import/no-unassigned-import */
import 'whatwg-fetch';
/* eslint-enable import/no-unassigned-import */

import { stringToType, typeToString } from '../../constants';

class CardCreationForm extends Component {
  constructor(props) {
    super(props);
  }

  createMenuItems(list) {
    return list.map((text, idx) =>
      <MenuItem key={idx} value={idx} primaryText={text}/>
    );
  }

  onUpdateText(text) {
    const sentences = text.split(/[\\.!\?]/);
    this.props.onSetText(sentences);
    sentences.forEach((sentence, index) => {
      if (sentence != '') {
        const parseUrl = `https://wordbots.herokuapp.com/parse?input=${encodeURIComponent(sentence)}&format=js`;
        fetch(parseUrl)
          .then(response => response.json())
          .then(json => { this.props.onParseComplete(index, sentence, json); });
        }
    });
  }

  render() {
    const cardTypes = ['Robot', 'Event', 'Structure'];

    return (
      <div style={{width: '50%', padding: 64}}>
        <Paper style={{padding: 48}}>
          <TextField
            defaultValue={this.props.name}
            floatingLabelText="Card Name"
            style={{width: '100%'}}
            onChange={e => { this.props.onSetName(e.target.value); }} />
          <SelectField
            value={cardTypes.indexOf(typeToString(this.props.type))}
            floatingLabelText="Card Type"
            style={{width: '100%'}}
            onChange={(e, idx) => { this.props.onSetType(stringToType(cardTypes[idx])); }}>
            {this.createMenuItems(cardTypes)}
          </SelectField>
          <TextField
            multiLine
            defaultValue=""
            floatingLabelText="Card Text"
            style={{width: '100%'}}
            onChange={e => { this.onUpdateText(e.target.value); }} />
        </Paper>
      </div>
    );
  }
}

CardCreationForm.propTypes = {
  name: React.PropTypes.string,
  type: React.PropTypes.number,
  text: React.PropTypes.string,

  onSetName: React.PropTypes.func,
  onSetType: React.PropTypes.func,
  onSetText: React.PropTypes.func,
  onParseComplete: React.PropTypes.func
};

export default CardCreationForm;
