import { Button, Checkbox, FormControl, FormControlLabel, Icon, InputAdornment, InputLabel, MenuItem, Paper, Select, Snackbar, TextField } from '@material-ui/core';
import { capitalize, compact, isEmpty } from 'lodash';
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
  flavorText: string
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
  onSetFlavorText: (flavorText: string) => void
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
  examplesLoaded: boolean
  submittedParseIssue: string | null
  submittedParseIssueConfirmationOpen: boolean
}

export default class CardCreationForm extends React.Component<CardCreationFormProps, CardCreationFormState> {
  private static styles: Record<string, React.CSSProperties> = {
    paper: {padding: 30, maxWidth: 800, margin: '0 auto'},

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
    fullWidth: {width: '100%'},

    attributeContainer: { width: '100%', marginRight: 25, marginTop: 8, textAlign: 'center' },
    attribute: { width: 50 },

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
    examplesLoaded: false,
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
      return 'Actions must have card text.';
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
    // Used by setStateIfMounted()
    // See https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
    (this as any)._isMounted = true;

    // Generate new spriteID on reload.
    if (!this.props.id) {
      this.props.onSpriteClick();
    }

    // This should only happen when we're loading an existing card (from Collection view).
    if (this.props.text !== '') {
      this.onUpdateText(this.props.text, this.props.type);
    }

    this.loadExampleCards();
  }

  public componentWillUnmount(): void {
    (this as any)._isMounted = false;
  }

  public render(): JSX.Element {
    const { isReadonly, willCreateAnother, onToggleWillCreateAnother } = this.props;
    const { examplesLoaded, submittedParseIssue, submittedParseIssueConfirmationOpen } = this.state;

    const FULL_WIDTH_PERCENT = 100;
    const NUMBER_OF_BUTTONS = 4;
    const MARGIN_PX = 15;

    const buttonMaxWidth = FULL_WIDTH_PERCENT / NUMBER_OF_BUTTONS;
    const buttonPadding = (MARGIN_PX * (NUMBER_OF_BUTTONS - 1)) / NUMBER_OF_BUTTONS;

    return (
      <div>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: MARGIN_PX, width: '100%', maxWidth: 860}}>
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
              label="Card Name"
              style={CardCreationForm.styles.leftCol}
              error={!!this.nameError}
              helperText={this.nameError}
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
              errorText={this.costError}
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
            <div style={{flex: 1, marginRight: 20}}>
              <CardTextField
                readonly={isReadonly}
                text={this.props.text}
                sentences={this.nonEmptySentences}
                error={this.textError}
                bigramProbs={this.state?.bigramProbs}
                onUpdateText={this.onUpdateText}
              />
            </div>
            <div style={CardCreationForm.styles.rightColContainer}>
              <Tooltip text="Having issues getting your card to work? Click here to submit it to us.">
                <Button
                  variant="contained"
                  color="secondary"
                  style={{width: 40, minWidth: 40}}
                  disabled={!this.hasTextError || !isEmpty(submittedParseIssue)}
                  onClick={this.handleClickReportParseIssue}
                >
                  <Icon className="material-icons" style={CardCreationForm.styles.icon}>report_problem</Icon>
                </Button>
              </Tooltip>
              <Snackbar
                open={submittedParseIssueConfirmationOpen}
                message={`Reported issue parsing '${submittedParseIssue}'. Thanks for the feedback!`}
                autoHideDuration={4000}
                onClose={this.handleCloseReportParseIssueSnackbar}
              />
            </div>
          </div>

          <div style={CardCreationForm.styles.section}>
            <TextField
              disabled={isReadonly}
              value={this.props.flavorText}
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
                  disabled={!this.isValid}
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
    this.props.onSetName(e.currentTarget.value);
  }

  private handleSetFlavorText = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (this.props.isReadonly) { return; }
    this.props.onSetFlavorText(e.currentTarget.value);
  }

  private handleSetType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (this.props.isReadonly) { return; }

    const value: w.CardType = parseInt(e.target.value) as w.CardType;
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
    const example: string | null = exampleStore.getExample(this.parserMode);
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

  private onUpdateText = (text: string, cardType: w.CardType = this.props.type, dontIndex = false) => {
    const parserMode = cardType === TYPE_EVENT ? 'event' : 'object';
    const sentences = getSentencesFromInput(text);

    this.props.onSetText(text);
    this.setState({ submittedParseIssue: null });
    requestParse(sentences, parserMode, this.props.onParseComplete, !dontIndex);
  }

  private loadExampleCards = async () => {
    const { corpus, examples } = await getCardTextCorpus();

    const bigramProbs = prepareBigramProbs(corpus);
    this.setStateIfMounted({ bigramProbs });

    exampleStore.loadExamples(examples, 100).then(() => {
      this.setStateIfMounted({ examplesLoaded: true });
    }).catch(console.error);
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
          errorText={(this as any as Record<string, string | undefined>)[`${attribute}Error`] || null}
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

  // Prevents warnings like:
  //   backend.js:1 Warning: Can't perform a React state update on an unmounted component.
  //   This is a no-op, but it indicates a memory leak in your application
  // TODO do this better with cancellable Promises or something
  private setStateIfMounted = (newState: Partial<CardCreationFormState>) => {
    if ((this as any)._isMounted) {
      this.setState(newState as any);
    }
  }
}
