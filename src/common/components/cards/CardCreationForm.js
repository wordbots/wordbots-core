import React, { Component } from 'react';
import TextField from 'material-ui/lib/text-field';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Paper from 'material-ui/lib/paper';
import RaisedButton from 'material-ui/lib/raised-button';
import FontIcon from 'material-ui/lib/font-icon';
import { every, flatMap, isNull, reduce } from 'lodash';
/* eslint-disable import/no-unassigned-import */
import 'whatwg-fetch';
/* eslint-enable import/no-unassigned-import */

import { CREATABLE_TYPES, TYPE_ROBOT, TYPE_EVENT, typeToString } from '../../constants';
import { isKeywordExpression, expandKeywords } from '../../keywords';
import { splitSentences } from '../../util';

import NumberField from './NumberField';

const SUBSTITUTIONS = {
  'creature': 'robot'
};

const DEBOUNCE_TIMEOUT_MS = 500;

class CardCreationForm extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.onSpriteClick();  // Generate new spriteID on reload.
  }

  normalizeText(text) {
    return reduce(SUBSTITUTIONS, (str, output, input) => str.replace(new RegExp(input, 'g'), output), text);
  }

  onUpdateText(text, cardType) {
    const parserMode = (cardType || this.props.type) === TYPE_EVENT ? 'event' : 'object';
    const sentences = flatMap(splitSentences(this.normalizeText(text)), sentence =>
      isKeywordExpression(sentence) ? sentence.replace(/,/g, ',|').split('|') : sentence
    );

    this.props.onSetText(sentences);

    if (this.parseRefreshTimer) {
      clearTimeout(this.parseRefreshTimer);
    }
    this.parseRefreshTimer = setTimeout(() => {
      sentences
        .forEach((sentence, idx) => {
          const parserInput = encodeURIComponent(expandKeywords(sentence));
          const parseUrl = `https://wordbots.herokuapp.com/parse?input=${parserInput}&format=js&mode=${parserMode}`;
          fetch(parseUrl)
            .then(response => response.json())
            .then(json => { this.props.onParseComplete(idx, sentence, json); });
      });
    }, DEBOUNCE_TIMEOUT_MS);
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
      this.props.name && this.props.name !== '[Unnamed]' &&
        CREATABLE_TYPES.includes(this.props.type) &&
        !isNull(this.props.energy) &&
        (!isNull(this.props.attack) || this.props.type !== TYPE_ROBOT) &&
        (!isNull(this.props.speed) >= 0 || this.props.type !== TYPE_ROBOT) &&
        (this.props.health >= 1 || this.props.type === TYPE_EVENT) &&
        (this.hasCardText() || this.props.type !== TYPE_EVENT) &&  // Events must have some card text.
        every(this.nonEmptySentences(), s => s.result.js)
    );
  }

  render() {
    // This should only happen when we're loading an existing card (from Collection view).
    if (this.props.setText) {
      this.onUpdateText(this.props.setText, this.props.type);
    }

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
                const cardText = this.props.sentences.map(s => s.sentence).join('. ');
                this.onUpdateText(cardText, value);
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
            defaultValue=""
            value={isNull(this.props.setText) ? undefined : this.props.setText}
            hintText={this.hasCardText() ? '' : 'Card Text'}
            style={{width: '100%'}}
            onChange={e => { this.onUpdateText(e.target.value); }} />

          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <NumberField
              label="Attack"
              value={this.props.attack}
              style={{width: '100%', marginRight: 25}}
              disabled={this.props.type !== TYPE_ROBOT}
              onChange={v => { this.props.onSetAttribute('attack', v); }} />
            <NumberField
              label="Speed"
              value={this.props.speed}
              style={{width: '100%', marginRight: 25}}
              disabled={this.props.type !== TYPE_ROBOT}
              onChange={v => { this.props.onSetAttribute('speed', v); }} />
            <NumberField
              label="Health"
              value={this.props.health}
              style={{width: '100%', marginRight: 25}}
              disabled={this.props.type === TYPE_EVENT}
              onChange={v => { this.props.onSetAttribute('health', v); }} />
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

const { array, bool, func, number, string } = React.PropTypes;

CardCreationForm.propTypes = {
  name: string,
  type: number,
  text: string,
  attack: number,
  speed: number,
  health: number,
  energy: number,
  sentences: array,
  setText: string,
  isNewCard: bool,

  onSetName: func,
  onSetType: func,
  onSetText: func,
  onSetAttribute: func,
  onParseComplete: func,
  onSpriteClick: func,
  onAddToCollection: func
};

export default CardCreationForm;
