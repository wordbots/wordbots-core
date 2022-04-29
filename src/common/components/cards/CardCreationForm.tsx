import { Button, Checkbox, FormControl, FormControlLabel, Icon, InputAdornment, InputLabel, MenuItem, Paper, Select, TextField } from '@material-ui/core';
import { capitalize, debounce, isEmpty } from 'lodash';
import * as React from 'react';
import { BigramProbs } from 'word-ngrams';

import { CREATABLE_TYPES, TYPE_EVENT, TYPE_ROBOT, typeToString } from '../../constants';
import * as w from '../../types';
import { CardValidationResults } from '../../util/cards';
import { filterProfanity } from '../../util/language';
import Tooltip from '../Tooltip';
import MustBeLoggedIn from '../users/MustBeLoggedIn';

import CardTextField from './CardTextField';
import NumberField from './NumberField';

interface CardCreationFormProps {
  id: string | null
  name: string
  type: w.CardType
  text: string
  sentences: w.Sentence[]
  flavorText: string
  attack: number
  speed: number
  health: number
  cost: number
  loggedIn: boolean
  isNewCard: boolean
  isReadonly: boolean
  willCreateAnother: boolean
  submittedParseIssue: string | null
  validationResults: CardValidationResults
  bigramProbs?: BigramProbs

  onSetName: (name: string) => void
  onSetType: (type: w.CardType) => void
  onUpdateText: (text: string, type?: w.CardType) => void
  onSetFlavorText: (flavorText: string) => void
  onSetAttribute: (attr: w.Attribute | 'cost', value: number) => void
  onSpriteClick: () => void
  onAddToCollection: (redirectToCollection: boolean) => void
  onOpenDialog: (dialog: string) => void
  onTestCard: () => void
  onToggleWillCreateAnother: () => void
  onSubmitParseIssue: () => void
}

interface CardCreationFormState {
  flavorText: string
}

export default class CardCreationForm extends React.Component<CardCreationFormProps, CardCreationFormState> {
  private static styles: Record<string, React.CSSProperties> = {
    paper: {
      padding: 30,
      maxWidth: 800,
      margin: '0 auto',
      // below adapted from https://codetea.com/pure-css-blueprint-pattern-using-css3-linear-gradients/
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backgroundImage: 'linear-gradient(rgba(34, 102, 153, .07) 2px, transparent 2px), linear-gradient(90deg, rgba(34, 102, 153, .07) 2px, transparent 2px), linear-gradient(rgba(34, 102, 153, .05) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 102, 153, .05) 1px, transparent 1px)',
      backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
      backgroundPosition: '-2px -2px, -2px -2px, -1px -1px, -1px -1px'
    },

    section: { display: 'flex', justifyContent: 'space-between', marginBottom: 5 },

    leftCol: {width: 'calc(100% - 65px)', marginRight: 25},
    rightColContainer: { display: 'flex', alignItems: 'center' },
    energyCost: {
      marginTop: -20,
      marginRight: -20,
      width: 65,
      height: 60,
      borderRadius: 60,
      backgroundColor: 'rgb(0 188 212 / 30%)',
      padding: 5
    },
    fullWidth: {width: '100%', background: 'white'},

    attributeContainer: { width: '100%', marginRight: 25, marginTop: 8, textAlign: 'center' },
    attribute: { width: 60 },

    buttonText: {
      fontSize: 14,
      textTransform: 'uppercase',
      fontWeight: 500,
      userSelect: 'none',
      paddingLeft: 16,
      paddingRight: 16,
      color: 'white'
    },
    saveButton: {marginTop: 20},
    createAnotherCheckbox: { margin: '15px 5px 0' },

    icon: {verticalAlign: 'middle', color: 'white'}
  };

  state = {
    flavorText: this.props.flavorText
  };

  get robot(): boolean { return this.props.type === TYPE_ROBOT; }
  get event(): boolean { return this.props.type === TYPE_EVENT; }

  get nonEmptySentences(): w.Sentence[] {
    return this.props.sentences.filter((s) => /\S/.test(s.sentence));
  }

  get hasTextError(): boolean {
    return this.props.validationResults.parseErrors.length > 0;
  }

  public componentDidMount(): void {
    // Generate new spriteID on reload.
    if (!this.props.id) {
      this.props.onSpriteClick();
    }

    // This should only happen when we're loading an existing card (from Collection view).
    if (this.props.text !== '') {
      this.props.onUpdateText(this.props.text, this.props.type);
    }
  }

  public render(): JSX.Element {
    const { isReadonly, validationResults, willCreateAnother, onToggleWillCreateAnother } = this.props;

    return (
      <div>
        <Paper style={CardCreationForm.styles.paper}>
          <div style={CardCreationForm.styles.section}>
            <TextField
              disabled={isReadonly}
              value={this.props.name}
              label="Card Name"
              style={CardCreationForm.styles.leftCol}
              error={!!validationResults.nameError}
              helperText={validationResults.nameError}
              onChange={this.handleSetName}
            />
            <NumberField
              disabled={isReadonly}
              label={<div style={{ marginLeft: 30, marginTop: 5 }}>Cost</div>}
              value={this.props.cost}
              minValue={0}
              maxValue={20}
              style={CardCreationForm.styles.energyCost}
              inputProps={{
                style: { textAlign: 'center', marginLeft: 8, fontSize: 20 },
                disableUnderline: true
              }}
              errorText={validationResults.costError}
              onChange={this.setAttribute('cost')}
            />
          </div>

          <div style={CardCreationForm.styles.section}>
            <FormControl style={{width: 'calc(100% - 60px)'}}>
              <InputLabel>Card Type</InputLabel>
              <Select
                disabled={isReadonly}
                value={this.props.type}
                onChange={this.handleSetType}
              >
                {
                  CREATABLE_TYPES.map((type) =>
                    <MenuItem key={type} value={type}>{typeToString(type)}</MenuItem>
                  )
                }
              </Select>
            </FormControl>
            <div style={CardCreationForm.styles.rightColContainer}>
              <Tooltip text="Generate a new image">
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={isReadonly}
                  style={{width: 40, minWidth: 40}}
                  onClick={this.props.onSpriteClick}
                >
                  <Icon className="material-icons" style={CardCreationForm.styles.icon}>refresh</Icon>
                </Button>
              </Tooltip>
            </div>
          </div>

          <div style={CardCreationForm.styles.section}>
            <div style={{flex: 1, marginRight: 20, background: 'white'}}>
              <CardTextField
                readonly={isReadonly}
                text={this.props.text}
                sentences={this.nonEmptySentences}
                error={validationResults.textError}
                bigramProbs={this.props.bigramProbs}
                onUpdateText={this.props.onUpdateText}
                debounceMs={150}
              />
            </div>
            <div style={CardCreationForm.styles.rightColContainer}>
              <Tooltip text="Having issues getting your card to work? Click here to let us know!">
                <Button
                  variant="contained"
                  color="secondary"
                  style={{width: 40, minWidth: 40}}
                  disabled={!this.hasTextError || !isEmpty(this.props.submittedParseIssue)}
                  onClick={this.props.onSubmitParseIssue}
                >
                  <Icon className="material-icons" style={CardCreationForm.styles.icon}>report_problem</Icon>
                </Button>
              </Tooltip>
            </div>
          </div>

          <div style={CardCreationForm.styles.section}>
            <TextField
              multiline
              variant="outlined"
              className="card-creator-text-field"
              disabled={isReadonly}
              rows={2}
              value={this.state.flavorText}
              label="Flavor Text (optional)"
              style={CardCreationForm.styles.fullWidth}
              onChange={this.handleSetFlavorText}
            />
          </div>

          <div style={CardCreationForm.styles.section}>
            {this.renderAttributeField('attack', this.robot && !isReadonly)}
            {this.renderAttributeField('health', !this.event && !isReadonly, {min: 1})}
            {this.renderAttributeField('speed', this.robot && !isReadonly, {max: 3})}
          </div>

          <div style={CardCreationForm.styles.section}>
            <div style={{ flex: 1 }}>
              <MustBeLoggedIn loggedIn={this.props.loggedIn}>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  disabled={!validationResults.isValid}
                  style={CardCreationForm.styles.saveButton}
                  onClick={this.handleSaveCard}
                >
                  {isReadonly ? 'Add to Collection' : 'Save Card'}
                </Button>
              </MustBeLoggedIn>
            </div>
            {!isReadonly && <FormControlLabel
              style={CardCreationForm.styles.createAnotherCheckbox}
              control={
                <Checkbox checked={willCreateAnother} onChange={onToggleWillCreateAnother} color="secondary" />
              }
              label="Create another?"
            />}
          </div>
        </Paper>
      </div>
    );
  }

  private setAttribute = (key: w.Attribute | 'cost') => (value: number) => {
    if (this.props.isReadonly) { return; }
    this.props.onSetAttribute(key, value);
  }

  private handleSetName = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (this.props.isReadonly) { return; }
    this.props.onSetName(filterProfanity(e.currentTarget.value));
  }

  private setFlavorTextDebounced = debounce(this.props.onSetFlavorText, 100);
  private handleSetFlavorText = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (this.props.isReadonly) { return; }
    const flavorText = filterProfanity(e.currentTarget.value);
    this.setState({ flavorText });
    this.setFlavorTextDebounced(flavorText);
  }

  private handleSetType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (this.props.isReadonly) { return; }

    const value: w.CardType = parseInt(e.target.value) as w.CardType;
    this.props.onSetType(value);
    // Re-parse card text because different card types now have different validations.
    this.props.onUpdateText(this.props.text, value);
  }

  private handleSaveCard = () => {
    this.props.onAddToCollection(!this.props.willCreateAnother);
  }

  private renderAttributeField(attribute: 'attack' | 'health' | 'speed', enabled = true, opts: { min?: number, max?: number } = {}): JSX.Element {
    const iconClasses = {
      attack: 'crossed-swords',
      speed: 'shoe-prints',
      health: 'health'
    };

    return (
      <div style={CardCreationForm.styles.attributeContainer}>
        <NumberField
          label={capitalize(attribute)}
          value={this.props[attribute]}
          minValue={opts.min || 0}
          maxValue={opts.max || 10}
          style={CardCreationForm.styles.attribute}
          disabled={!enabled}
          errorText={this.props.validationResults[`${attribute}Error` as 'attackError' | 'healthError' | 'speedError']}
          onChange={this.setAttribute(attribute)}
          inputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon
                  className={`ra ra-${iconClasses[attribute]}`}
                  style={{ fontSize: 14, marginRight: 4, lineHeight: 1.2 }}
                />
              </InputAdornment>
            )
          }}
        />
      </div>
    );
  }
}
