import React, { Component } from 'react';
import TextField from 'material-ui/lib/text-field';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Paper from 'material-ui/lib/paper';
import RaisedButton from 'material-ui/lib/raised-button';
import FontIcon from 'material-ui/lib/font-icon';

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
              onChange={e => { this.props.onSetEnergy(isNaN(parseInt(e.target.value)) ? null : parseInt(e.target.value)); }} />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <SelectField
              value={cardTypes.indexOf(typeToString(this.props.type))}
              floatingLabelText="Card Type"
              style={{width: '80%', marginRight: 25}}
              onChange={(e, idx) => { this.props.onSetType(stringToType(cardTypes[idx])); }}>
              {this.createMenuItems(cardTypes)}
            </SelectField>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <RaisedButton
                secondary
                label="New Image"
                style={{width: 160}}
                labelPosition="after"
                onTouchTap={(e) => { this.props.onSpriteClick(); }}>
                <FontIcon className="material-icons" style={{
                  verticalAlign: 'middle',
                  color: 'white'
                }}>refresh</FontIcon>
              </RaisedButton>
            </div>
          </div>
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
              disabled={this.props.type !== 0}
              floatingLabelText="Attack"
              style={{width: '100%', marginRight: 25}}
              type="number"
              onChange={e => { this.props.onSetAttack(isNaN(parseInt(e.target.value)) ? null : parseInt(e.target.value)); }} />
            <TextField
              defaultValue={this.props.speed}
              disabled={this.props.type !== 0}
              floatingLabelText="Speed"
              style={{width: '100%', marginRight: 25}}
              type="number"
              onChange={e => { this.props.onSetSpeed(isNaN(parseInt(e.target.value)) ? null : parseInt(e.target.value)); }} />
            <TextField
              defaultValue={this.props.health}
              disabled={this.props.type == 1}
              floatingLabelText="Health"
              style={{width: '100%'}}
              type="number"
              onChange={e => { this.props.onSetHealth(isNaN(parseInt(e.target.value)) ? null : parseInt(e.target.value)); }} />
          </div>
          <RaisedButton
            primary
            fullWidth
            label="Add to Collection"
            style={{marginTop: 20}}
            onTouchTap={(e) => { this.props.onAddToCollection(); }} />
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

  onParseComplete: React.PropTypes.func,
  onSpriteClick: React.PropTypes.func,
  onAddToCollection: React.PropTypes.func
};

export default CardCreationForm;
