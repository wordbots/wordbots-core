import React, { Component } from 'react';
import { bool, func, number, string } from 'prop-types';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import { every } from 'lodash';
/* eslint-disable import/no-unassigned-import */
import 'whatwg-fetch';
/* eslint-enable import/no-unassigned-import */

import { CREATABLE_TYPES, TYPE_ROBOT, TYPE_EVENT, typeToString } from '../../constants';
import { getSentencesFromInput, requestParse, splitSentences } from '../../util/cards';

import NumberField from './NumberField';

export default class CardCreationForm extends Component {
  static propTypes = {
    name: string,
    type: number,
    text: string,
    attack: number,
    speed: number,
    health: number,
    energy: number,
    isNewCard: bool,

    onSetName: func,
    onSetType: func,
    onSetText: func,
    onSetAttribute: func,
    onParseComplete: func,
    onSpriteClick: func,
    onAddToCollection: func
  };

  componentDidMount() {
    // Generate new spriteID on reload.
    if (!this.props.isNewCard) {
      this.props.onSpriteClick();
    }

    // This should only happen when we're loading an existing card (from Collection view).
    if (this.props.text !== '') {
      this.onUpdateText(this.props.text, this.props.type);
    }
  }

  onUpdateText(text, cardType) {
    const parserMode = (cardType || this.props.type) === TYPE_EVENT ? 'event' : 'object';
    const sentences = getSentencesFromInput(text);

    this.props.onSetText(text);
    requestParse(sentences, parserMode, this.props.onParseComplete);
  }

  nonEmptySentences() {
    return splitSentences(this.props.text).filter(s => /\S/.test(s.sentence));
  }

  hasCardText() {
    return this.nonEmptySentences().length > 0;
  }

  isValid() {
    // Name exists + type is valid + stats are present + all sentences parseable.
    return (
      this.props.name && this.props.name !== '[Unnamed]' &&
        CREATABLE_TYPES.includes(this.props.type) &&
        (this.props.energy >= 0 && this.props.energy <= 20) &&
        ((this.props.attack >= 0 && this.props.attack <= 10) || this.props.type !== TYPE_ROBOT) &&
        ((this.props.speed >= 0 && this.props.speed <= 3) || this.props.type !== TYPE_ROBOT) &&
        ((this.props.health >= 1 && this.props.health <= 10)|| this.props.type === TYPE_EVENT) &&
        (this.hasCardText() || this.props.type !== TYPE_EVENT) &&  // Events must have some card text.
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
              style={{flexBasis: 0, flexGrow: 3, marginRight: 25}}
              onChange={e => { this.props.onSetName(e.target.value); }} />
            <NumberField
              label="Energy Cost"
              value={this.props.energy}
              maxValue={20}
              style={{flexBasis: 0, flexGrow: 1}}
              onChange={v => { this.props.onSetAttribute('energy', v); }} />
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <SelectField
              value={this.props.type}
              floatingLabelText="Card Type"
              style={{width: '80%', marginRight: 25}}
              onChange={(e, i, value) => {
                this.props.onSetType(value);
                // Re-parse card text because different card types now have different validations.
                this.onUpdateText(this.props.text, value);
              }}>
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
            value={this.props.text}
            hintText={this.hasCardText() ? '' : 'Card Text'}
            style={{width: '100%'}}
            onChange={e => { this.onUpdateText(e.target.value); }} />

          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <NumberField
              label="Attack"
              value={this.props.attack}
              maxValue={10}
              style={{width: '100%', marginRight: 25}}
              disabled={this.props.type !== TYPE_ROBOT}
              onChange={v => { this.props.onSetAttribute('attack', v); }} />
            <NumberField
              label="Health"
              value={this.props.health}
              maxValue={10}
              style={{width: '100%', marginRight: 25}}
              disabled={this.props.type === TYPE_EVENT}
              onChange={v => { this.props.onSetAttribute('health', v); }} />
            <NumberField
              label="Speed"
              value={this.props.speed}
              maxValue={3}
              style={{width: '100%', marginRight: 25}}
              disabled={this.props.type !== TYPE_ROBOT}
              onChange={v => { this.props.onSetAttribute('speed', v); }} />
          </div>

          <RaisedButton
            primary
            fullWidth
            label={this.props.isNewCard ? 'Save Edits' : 'Add to Collection'}
            disabled={!this.isValid()}
            style={{marginTop: 20}}
            onTouchTap={e => { this.props.onAddToCollection(); }} />
        </Paper>
      </div>
    );
  }
}
