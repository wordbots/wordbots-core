import React, { Component } from 'react';
import { array, bool, func, number, string, object } from 'prop-types';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import { compact } from 'lodash';

import { CREATABLE_TYPES, TYPE_ROBOT, TYPE_EVENT, typeToString } from '../../constants';
import { getSentencesFromInput, requestParse } from '../../util/cards';
import MustBeLoggedIn from '../users/MustBeLoggedIn';
import Dictionary from '../../containers/Dictionary';

import NumberField from './NumberField';

export default class CardCreationForm extends Component {
  static propTypes = {
    name: string,
    type: number,
    text: string,
    sentences: array,
    attack: number,
    speed: number,
    health: number,
    energy: number,
    isNewCard: bool,
    loggedIn: bool,

    history: object,

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

  get robot() { return this.props.type === TYPE_ROBOT; }
  get event() { return this.props.type === TYPE_EVENT; }

  get nonEmptySentences() {
    return this.props.sentences.filter(s => /\S/.test(s.sentence));
  }

  get hasCardText() {
    return this.nonEmptySentences.length > 0;
  }

  get fullParse() {
    return compact(this.nonEmptySentences.map(s => s.result.js)).join(' ');
  }

  get parseErrors() {
    return compact(this.nonEmptySentences.map(s => s.result.error));
  }

  get nameError() {
    if (!this.props.name || this.props.name === '[Unnamed]') {
      return 'This card needs a name!';
    }
  }

  get typeError() {
    if (!CREATABLE_TYPES.includes(this.props.type)) {
      return 'Invalid type.';
    }
  }

  get costError() {
    if (!parseInt(this.props.energy)) {
      return 'Invalid cost.';
    }

    if (this.props.energy < 0 || this.props.energy > 20) {
      return 'Not between 0 and 20.';
    }
  }

  get attackError() {
    if (this.robot) {
      if (!parseInt(this.props.attack)) {
        return 'Invalid attack.';
      }

      if (this.props.attack < 0 || this.props.attack > 10) {
        return 'Not between 0 and 10.';
      }
    }
  }

  get healthError() {
    if (!this.event) {
      if (!parseInt(this.props.health)) {
        return 'Invalid health.';
      }

      if (this.props.health < 1 || this.props.health > 10) {
        return 'Not between 1 and 10.';
      }
    }
  }

  get speedError() {
    if (this.robot) {
      if (!parseInt(this.props.speed)) {
        return 'Invalid speed.';
      }

      if (this.props.speed < 0 || this.props.speed > 3) {
        return 'Not between 0 and 3.';
      }
    }
  }

  get textError() {
    if (this.event && !this.hasCardText) {
      return 'Events must have card text.';
    }

    if (this.parseErrors.length > 0) {
      return this.parseErrors.map(e => e.endsWith('.') ? e : `${e}.`).join(' ');
    } else if (this.nonEmptySentences.find(s => !s.result.js)) {
      return 'Sentences are still being parsed ...';
    } else {
      // Check for >1 target in each logical unit of the parsed JS.
      // Activated abilities separate logical units:
      //     BAD <- "Deal 2 damage. Destroy a structure."
      //    GOOD <- "Activate: Deal 2 damage. Activate: Destroy a structure."
      const units = compact(this.fullParse.split('abilities[\'activated\']'));
      const numTargets = units.map(unit => (unit.match(/choose/g) || []).length);
      if (numTargets.find(n => n > 1)) {
        return `We do not yet support multiple target selection (expected 0 or 1 targets, got ${numTargets.find(n => n > 1)}).`;
      }
    }
  }

  get isValid() {
    return !this.nameError && !this.typeError && !this.costError && !this.attackError &&
      !this.healthError && !this.speedError && !this.textError;
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
              errorText={this.nameError}
              onChange={e => { this.props.onSetName(e.target.value); }} />
            <NumberField
              label="Energy Cost"
              value={this.props.energy}
              maxValue={20}
              style={{flexBasis: 0, flexGrow: 1}}
              errorText={this.costError}
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

          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <TextField
              multiLine
              value={this.props.text}
              hintText={this.hasCardText ? '' : 'Card Text'}
              style={{width: '80%', marginRight: 25}}
              errorText={this.textError}
              onChange={e => { this.onUpdateText(e.target.value); }} />
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <RaisedButton
                label="Open Dictionary"
                primary
                style={{width: 160}}
                onClick={() => { this.props.history.push('/creator/dictionary'); }} />
            </div>
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <NumberField
              label="Attack"
              value={this.props.attack}
              maxValue={10}
              style={{width: '100%', marginRight: 25}}
              disabled={!this.robot}
              errorText={this.attackError}
              onChange={v => { this.props.onSetAttribute('attack', v); }} />
            <NumberField
              label="Health"
              value={this.props.health}
              maxValue={10}
              style={{width: '100%', marginRight: 25}}
              disabled={this.event}
              errorText={this.healthError}
              onChange={v => { this.props.onSetAttribute('health', v); }} />
            <NumberField
              label="Speed"
              value={this.props.speed}
              maxValue={3}
              style={{width: '100%', marginRight: 25}}
              disabled={!this.robot}
              errorText={this.speedError}
              onChange={v => { this.props.onSetAttribute('speed', v); }} />
          </div>

          <MustBeLoggedIn loggedIn={this.props.loggedIn}>
            <RaisedButton
            primary
            fullWidth
            label={this.props.isNewCard ? 'Save Edits' : 'Add to Collection'}
            disabled={!this.isValid}
            style={{marginTop: 20}}
            onTouchTap={e => { this.props.onAddToCollection(); }} />
          </MustBeLoggedIn>
        </Paper>

        <Dialog
          open={this.props.history !== undefined && this.props.history.location.pathname.includes('dictionary')}
          contentStyle={{width: '90%', maxWidth: 'none'}}
          onRequestClose={() => { this.props.history.push('/creator'); }}
          actions={[<RaisedButton primary label="Close" onTouchTap={() => { this.props.history.push('/creator'); }} />]}
        >
          <Dictionary />
        </Dialog>
      </div>
    );
  }
}
