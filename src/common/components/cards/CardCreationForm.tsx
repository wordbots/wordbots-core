import { Checkbox, FormControlLabel } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { capitalize, compact, isEmpty } from 'lodash';
import FontIcon from 'material-ui/FontIcon';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import Snackbar from 'material-ui/Snackbar';
import TextField from 'material-ui/TextField';
import * as React from 'react';
import { BigramProbs } from 'word-ngrams';

import { CREATABLE_TYPES, TYPE_EVENT, TYPE_ROBOT, typeToString } from '../../constants';
import * as w from '../../types';
import { getSentencesFromInput, requestParse } from '../../util/cards';
import CardTextExampleStore from '../../util/CardTextExampleStore';
import { ensureInRange } from '../../util/common';
import { getCardTextCorpus, saveReportedParseIssue } from '../../util/firebase';
import { prepareBigramProbs } from '../../util/language';
import ButtonInRow from '../ButtonInRow';
import Tooltip from '../Tooltip';
import MustBeLoggedIn from '../users/MustBeLoggedIn';

import CardTextField from './CardTextField';
import NumberField from './NumberField';

const exampleStore = new CardTextExampleStore();

interface CardCreationFormProps {
  id: string | null
  name: string
  type: w.CardType
  text: string
  sentences: w.Sentence[]
  attack: number
  speed: number
  health: number
  cost: number
  loggedIn: boolean
  isNewCard: boolean
  isReadonly: boolean
  willCreateAnother: boolean

  onSetName: (name: string) => void
  onSetType: (type: w.CardType) => void
  onSetText: (text: string) => void
  onSetAttribute: (attr: w.Attribute | 'cost', value: number) => void
  onParseComplete: (idx: number, sentence: string, result: w.ParseResult) => void
  onSpriteClick: () => void
  onAddToCollection: (redirectToCollection: boolean) => void
  onOpenDialog: (dialog: string) => void
  onTestCard: () => void
  onToggleWillCreateAnother: () => void
}

interface CardCreationFormState {
  bigramProbs?: BigramProbs
  examplesLoaded: {
    event: boolean
    object: boolean
  }
  submittedParseIssue: string | null
  submittedParseIssueConfirmationOpen: boolean
}

export default class CardCreationForm extends React.Component<CardCreationFormProps, CardCreationFormState> {
  private static styles: Record<string, React.CSSProperties> = {
    container: {width: '60%', flex: 1, paddingTop: 64, paddingLeft: 48, paddingRight: 32},
    paper: {padding: 30, maxWidth: 800, margin: '0 auto'},

    section: {display: 'flex', justifyContent: 'space-between'},

    leftCol: {width: '70%', marginRight: 25},
    rightColContainer: {display: 'flex', alignItems: 'center'},
    rightCol: {width: 210},
    attribute: {width: '100%', marginRight: 25},
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

  public state: CardCreationFormState = {
    examplesLoaded: {
      event: false,
      object: false
    },
    submittedParseIssue: null,
    submittedParseIssueConfirmationOpen: false
  };

  get robot(): boolean { return this.props.type === TYPE_ROBOT; }
  get event(): boolean { return this.props.type === TYPE_EVENT; }

  get nonEmptySentences(): w.Sentence[] {
    return this.props.sentences.filter((s) => /\S/.test(s.sentence));
  }

  get hasCardText(): boolean {
    return this.nonEmptySentences.length > 0;
  }

  get fullParse(): string {
    return compact(this.nonEmptySentences.map((s) => s.result.js)).join(' ');
  }

  get parserMode(): 'event' | 'object' {
    return this.props.type === TYPE_EVENT ? 'event' : 'object';
  }

  get parseErrors(): string[] {
    return compact(this.nonEmptySentences.map((s) => s.result.error)).map((error) =>
      (`${error}.`)
        .replace('..', '.')
        .replace('Parser did not produce a valid expression', 'Parser error')
    );
  }

  get nameError(): string | null {
    if (!this.props.name || this.props.name === '[Unnamed]') {
      return 'This card needs a name!';
    }
    return null;
  }

  get typeError(): string | null {
    if (!CREATABLE_TYPES.includes(this.props.type)) {
      return 'Invalid type.';
    }
    return null;
  }

  get costError(): string | null {
    return ensureInRange('cost', this.props.cost, 0, 20);
  }

  get attackError(): string | null {
    if (this.robot) {
      return ensureInRange('attack', this.props.attack, 0, 10);
    }
    return null;
  }

  get healthError(): string | null {
    if (!this.event) {
      return ensureInRange('health', this.props.health, 1, 10);
    }
    return null;
  }

  get speedError(): string | null {
    if (this.robot) {
      return ensureInRange('speed', this.props.speed, 0, 3);
    }
    return null;
  }

  get textError(): string | null {
    if (this.event && !this.hasCardText) {
      return 'Events must have card text.';
    } else if (this.parseErrors.length > 0) {
      return this.parseErrors.join(' ');
    } else if (this.nonEmptySentences.find((s) => !s.result.js)) {
      return 'Sentences are still being parsed ...';
    } else {
      return null;
    }
  }

  get hasTextError(): boolean {
    return this.parseErrors.length > 0;
  }

  get isValid(): boolean {
    return !this.nameError && !this.typeError && !this.costError && !this.attackError &&
      !this.healthError && !this.speedError && !this.textError;
  }

  public componentDidMount(): void {
    // Generate new spriteID on reload.
    if (!this.props.id) {
      this.props.onSpriteClick();
    }

    // This should only happen when we're loading an existing card (from Collection view).
    if (this.props.text !== '') {
      this.onUpdateText(this.props.text, this.props.type);
    }

    getCardTextCorpus((corpus, examples) => {
      this.setState({
        bigramProbs: prepareBigramProbs(corpus)
      });
      exampleStore.loadExamples(examples, 100, (mode) => {
        this.setState((state) => ({
          examplesLoaded: {...state.examplesLoaded, [mode]: true}
        }));
      });
    });
  }

  public render(): JSX.Element {
    const { isReadonly, willCreateAnother, onToggleWillCreateAnother } = this.props;
    const { submittedParseIssue, submittedParseIssueConfirmationOpen } = this.state;
    const examplesLoaded = this.state.examplesLoaded[this.parserMode];

    const FULL_WIDTH_PERCENT = 100;
    const NUMBER_OF_BUTTONS = 4;
    const MARGIN_PX = 15;

    const buttonMaxWidth = FULL_WIDTH_PERCENT / NUMBER_OF_BUTTONS;
    const buttonPadding = (MARGIN_PX * (NUMBER_OF_BUTTONS - 1)) / NUMBER_OF_BUTTONS;

    return (
      <div style={CardCreationForm.styles.container}>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: MARGIN_PX, width: '100%', maxWidth: 800}}>
            <ButtonInRow
              label="Help"
              icon="help_outline"
              tooltip="Learn more about creating a card."
              width={`calc(${buttonMaxWidth}% - ${buttonPadding}px)`}
              onClick={this.handleClickHelp}
            />
            <ButtonInRow
              label="Dictionary"
              icon="book"
              tooltip="Check out all of the terms and actions that the parser supports."
              width={`calc(${buttonMaxWidth}% - ${buttonPadding}px)`}
              onClick={this.handleClickDictionary}
            />
            <ButtonInRow
              label="Randomize"
              icon="refresh"
              tooltip={`Generate random text for the card. ${examplesLoaded ? '' : '(Loading examples ...)'}`}
              onClick={this.handleClickRandomize}
              width={`calc(${buttonMaxWidth}% - ${buttonPadding}px)`}
              disabled={!examplesLoaded || isReadonly}
            />
            <ButtonInRow
              label="Test"
              icon="videogame_asset"
              tooltip="Test out this card in sandbox mode."
              onClick={this.props.onTestCard}
              width={`calc(${buttonMaxWidth}% - ${buttonPadding}px)`}
              disabled={!this.isValid}
            />
          </div>
        </div>

        <Paper style={CardCreationForm.styles.paper}>
          <div style={CardCreationForm.styles.section}>
            <TextField
              disabled={isReadonly}
              value={this.props.name}
              floatingLabelText="Card Name"
              style={CardCreationForm.styles.leftCol}
              errorText={this.nameError}
              onChange={this.handleSetName}
            />
            <NumberField
              disabled={isReadonly}
              label="Energy Cost"
              value={this.props.cost}
              maxValue={20}
              style={CardCreationForm.styles.rightCol}
              errorText={this.costError}
              onChange={this.setAttribute('cost')}
            />
          </div>

          <div style={CardCreationForm.styles.section}>
            <SelectField
              disabled={isReadonly}
              value={this.props.type}
              floatingLabelText="Card Type"
              style={{width: 'calc(100% - 60px)'}}
              onChange={this.handleSetType}
            >
              {
                CREATABLE_TYPES.map((type) =>
                  <MenuItem key={type} value={type} primaryText={typeToString(type)} />
                )
              }
            </SelectField>
            <div style={CardCreationForm.styles.rightColContainer}>
              <Tooltip text="Generate a new image">
                <RaisedButton
                  disabled={isReadonly}
                  primary
                  style={{width: 40, minWidth: 40}}
                  onClick={this.props.onSpriteClick}
                >
                  <FontIcon className="material-icons" style={CardCreationForm.styles.icon}>refresh</FontIcon>
                </RaisedButton>
              </Tooltip>
            </div>
          </div>

          <div style={CardCreationForm.styles.section}>
            <div style={{flex: 1, marginRight: 20}}>
              <CardTextField
                readonly={isReadonly}
                text={this.props.text}
                sentences={this.nonEmptySentences}
                error={this.textError}
                bigramProbs={this.state && this.state.bigramProbs}
                onUpdateText={this.onUpdateText}
              />
            </div>
            <div style={CardCreationForm.styles.rightColContainer}>
              <Tooltip text="Having issues getting your card to work? Click here to submit it to us.">
                <RaisedButton
                  secondary
                  style={{width: 40, minWidth: 40}}
                  disabled={!this.hasTextError || !isEmpty(submittedParseIssue)}
                  onClick={this.handleClickReportParseIssue}
                >
                  <FontIcon className="material-icons" style={CardCreationForm.styles.icon}>report_problem</FontIcon>
                </RaisedButton>
              </Tooltip>
              <Snackbar
                open={submittedParseIssueConfirmationOpen}
                message={`Reported issue parsing '${submittedParseIssue}'. Thanks for the feedback!`}
                autoHideDuration={4000}
                onRequestClose={this.handleCloseReportParseIssueSnackbar}
              />
            </div>
          </div>

          <div style={CardCreationForm.styles.section}>
            {this.renderAttributeField('attack', this.robot && !isReadonly)}
            {this.renderAttributeField('health', !this.event && !isReadonly)}
            {this.renderAttributeField('speed', this.robot && !isReadonly, {max: 3})}
          </div>

          <div style={CardCreationForm.styles.section}>
            <div style={{ flex: 1 }}>
              <MustBeLoggedIn loggedIn={this.props.loggedIn}>
                <RaisedButton
                  primary
                  fullWidth
                  label={isReadonly ? "Add to Collection" : "Save Card"}
                  disabled={!this.isValid}
                  style={CardCreationForm.styles.saveButton}
                  onClick={this.handleSaveCard}
                />
              </MustBeLoggedIn>
            </div>
            {!isReadonly && <FormControlLabel
              style={CardCreationForm.styles.createAnotherCheckbox}
              control={
                <Checkbox checked={willCreateAnother} onChange={onToggleWillCreateAnother} color="primary" />
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

  private handleSetName = (_e: React.FormEvent<HTMLElement>, value: string) => {
    if (this.props.isReadonly) { return; }
    this.props.onSetName(value);
  }

  private handleSetType = (_e: React.SyntheticEvent<any>, _i: number, value: w.CardType) => {
    if (this.props.isReadonly) { return; }
    this.props.onSetType(value);
    // Re-parse card text because different card types now have different validations.
    this.onUpdateText(this.props.text, value);
  }

  private handleClickHelp = () => {
    this.props.onOpenDialog('help');
  }

  private handleClickDictionary = () => {
    this.props.onOpenDialog('dictionary');
  }

  private handleClickRandomize = () => {
    if (this.props.isReadonly) { return; }
    const example = exampleStore.getExample(this.parserMode);
    if (example) {
      this.onUpdateText(example, this.props.type, true);
    }
  }

  private handleClickReportParseIssue = () => {
    if (this.hasTextError) {
      saveReportedParseIssue(this.props.text);
      this.setState({
        submittedParseIssue: this.props.text,
        submittedParseIssueConfirmationOpen: true
      });
    }
  }

  private handleCloseReportParseIssueSnackbar = () => {
    this.setState({ submittedParseIssueConfirmationOpen: false });
  }

  private handleSaveCard = () => {
    this.props.onAddToCollection(!this.props.willCreateAnother);
  }

  private onUpdateText = (text: string, cardType: w.CardType = this.props.type, dontIndex: boolean = false) => {
    const parserMode = cardType === TYPE_EVENT ? 'event' : 'object';
    const sentences = getSentencesFromInput(text);

    this.props.onSetText(text);
    this.setState({ submittedParseIssue: null });
    requestParse(sentences, parserMode, this.props.onParseComplete, !dontIndex);
  }

  private renderAttributeField(attribute: 'attack' | 'health' | 'speed', enabled = true, opts: { max?: number } = {}): JSX.Element {
    return (
      <NumberField
        label={capitalize(attribute)}
        value={this.props[attribute]}
        maxValue={opts.max || 10}
        style={CardCreationForm.styles.attribute}
        disabled={!enabled}
        errorText={(this as any as Record<string, string | undefined>)[`${attribute}Error`] || null}
        onChange={this.setAttribute(attribute)}
      />
    );
  }
}
