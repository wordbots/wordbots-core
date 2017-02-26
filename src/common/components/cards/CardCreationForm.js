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
      if (/\S/.test(sentence)) {
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
          <div style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <TextField
              defaultValue={this.props.name}
              floatingLabelText="Card Name"
              style={{marginRight: 25, flexGrow: 3}}
              onChange={e => { this.props.onSetName(e.target.value); }} />
            <TextField
              defaultValue={this.props.energy}
              floatingLabelText="Energy Cost"
              style={{width: 'none', flexGrow: 1}}
              type="number"
              onChange={e => { this.props.onSetEnergy(parseInt(e.target.value)); }} />
          </div>
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
          <div style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <TextField
              defaultValue={this.props.attack}
              floatingLabelText="Attack"
              style={{width: '100%', marginRight: 25}}
              type="number"
              onChange={e => { this.props.onSetAttack(parseInt(e.target.value)); }} />
            <TextField
              defaultValue={this.props.speed}
              floatingLabelText="Speed"
              style={{width: '100%', marginRight: 25}}
              type="number"
              onChange={e => { this.props.onSetSpeed(parseInt(e.target.value)); }} />
            <TextField
              defaultValue={this.props.health}
              floatingLabelText="Health"
              style={{width: '100%'}}
              type="number"
              onChange={e => { this.props.onSetHealth(parseInt(e.target.value)); }} />
          </div>
        </Paper>
      </div>
    );
  }
}

CardCreationForm.propTypes = {
  name: React.PropTypes.string,
  type: React.PropTypes.number,
  text: React.PropTypes.string,
  attack: React.PropTypes.number,
  speed: React.PropTypes.number,
  health: React.PropTypes.number,
  energy: React.PropTypes.number,

  onSetName: React.PropTypes.func,
  onSetType: React.PropTypes.func,
  onSetText: React.PropTypes.func,
  onSetAttack: React.PropTypes.func,
  onSetSpeed: React.PropTypes.func,
  onSetHealth: React.PropTypes.func,
  onSetEnergy: React.PropTypes.func,

  onParseComplete: React.PropTypes.func
};

export default CardCreationForm;
