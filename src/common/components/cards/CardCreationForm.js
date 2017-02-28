import React, { Component } from 'react';
import TextField from 'material-ui/lib/text-field';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Paper from 'material-ui/lib/paper';
import RaisedButton from 'material-ui/lib/raised-button';
import FontIcon from 'material-ui/lib/font-icon';
import { every, isNull } from 'lodash';
/* eslint-disable import/no-unassigned-import */
import 'whatwg-fetch';
/* eslint-enable import/no-unassigned-import */

import { CREATABLE_TYPES, TYPE_ROBOT, TYPE_EVENT, typeToString } from '../../constants';

import NumberField from './NumberField';

class CardCreationForm extends Component {
  constructor(props) {
    super(props);
  }

  onUpdateText(text) {
    const sentences = text.split(/[\\.!\?]/);
    const debounceTimeoutMs = 500;

    this.props.onSetText(sentences);

    if (this.updateTextTimer) {
      clearTimeout(this.updateTextTimer);
    }
    this.updateTextTimer = setTimeout(() => {
      sentences
        .filter(sentence => /\S/.test(sentence))
        .forEach((sentence, idx) => {
          const parseUrl = `https://wordbots.herokuapp.com/parse?input=${encodeURIComponent(sentence)}&format=js`;
          fetch(parseUrl)
            .then(response => response.json())
            .then(json => { this.props.onParseComplete(idx, sentence, json); });
      });
    }, debounceTimeoutMs);
  }

  nonEmptySentences() {
    return this.props.sentences.filter(s => /\S/.test(s.sentence));
  }

  hasCardText() {
    return this.nonEmptySentences().length > 0;
  }

  isValid() {
    // Name exists + type is valid + stats are present + all sentences parseable.
    return (
      this.props.name && this.props.name != '[Unnamed]' &&
        CREATABLE_TYPES.includes(this.props.type) &&
        !isNull(this.props.energy) &&
        (!isNull(this.props.attack) || this.props.type != TYPE_ROBOT) &&
        (!isNull(this.props.speed) >= 0 || this.props.type != TYPE_ROBOT) &&
        (this.props.health >= 1 || this.props.type == TYPE_EVENT) &&
        every(this.nonEmptySentences(), s => s.result.js)
    );
  }

  render() {
    return (
      <div style={{width: '50%', padding: 64}}>
        <Paper style={{padding: 48}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <TextField
              value={this.props.name}
              floatingLabelText="Card Name"
              style={{marginRight: 25, flexGrow: 3}}
              onChange={e => { this.props.onSetName(e.target.value); }} />
            <NumberField
              label="Energy Cost"
              value={this.props.energy}
              style={{width: 'none', flexGrow: 1}}
              onChange={this.props.onSetEnergy} />
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <SelectField
              value={this.props.type}
              floatingLabelText="Card Type"
              style={{width: '80%', marginRight: 25}}
              onChange={(e, i, value) => { this.props.onSetType(value); }}>
              {
                CREATABLE_TYPES.map(type => <MenuItem key={type} value={type} primaryText={typeToString(type)}/>)
              }
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
            value={this.props.textCleared ? '' : undefined}
            hintText={this.hasCardText() ? '' : 'Card Text'}
            style={{width: '100%'}}
            onChange={e => { this.onUpdateText(e.target.value); }} />

          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <NumberField
              label="Attack"
              value={this.props.attack}
              style={{width: '100%', marginRight: 25}}
              disabled={this.props.type !== TYPE_ROBOT}
              onChange={this.props.onSetAttack} />
            <NumberField
              label="Speed"
              value={this.props.speed}
              style={{width: '100%', marginRight: 25}}
              disabled={this.props.type !== TYPE_ROBOT}
              onChange={this.props.onSetSpeed} />
            <NumberField
              label="Health"
              value={this.props.health}
              style={{width: '100%', marginRight: 25}}
              disabled={this.props.type === TYPE_EVENT}
              onChange={this.props.onSetHealth} />
          </div>

          <RaisedButton
            primary
            fullWidth
            label="Add to Collection"
            disabled={!this.isValid()}
            style={{marginTop: 20}}
            onTouchTap={e => { this.props.onAddToCollection(); }} />
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
  sentences: React.PropTypes.array,
  textCleared: React.PropTypes.bool,

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
