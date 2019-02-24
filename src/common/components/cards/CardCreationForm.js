import * as React from 'react';
import { arrayOf, bool, func, number, object, string } from 'prop-types';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Paper from '@material-ui/core/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import Snackbar from 'material-ui/Snackbar';
import { capitalize, compact, isEmpty } from 'lodash';

import { CREATABLE_TYPES, TYPE_ROBOT, TYPE_EVENT, typeToString } from '../../constants.ts';
import { ensureInRange } from '../../util/common.ts';
import { getSentencesFromInput, requestParse } from '../../util/cards.ts';
import { getCardTextCorpus, saveReportedParseIssue } from '../../util/firebase.ts';
import { prepareBigramProbs } from '../../util/language.ts';
import CardTextExampleStore from '../../util/CardTextExampleStore.ts';
import ButtonInRow from '../ButtonInRow.tsx';
import Tooltip from '../Tooltip';
import MustBeLoggedIn from '../users/MustBeLoggedIn';

import CardTextField from './CardTextField';
import NumberField from './NumberField';

const exampleStore = new CardTextExampleStore();

export default class CardCreationForm extends React.Component {
  static propTypes = {
    id: string,
    name: string,
    type: number,
    text: string,
    sentences: arrayOf(object),
    attack: number,
    speed: number,
    health: number,
    cost: number,
    isNewCard: bool,
    loggedIn: bool,

    onSetName: func,
    onSetType: func,
    onSetText: func,
    onSetAttribute: func,
    onParseComplete: func,
    onSpriteClick: func,
    onAddToCollection: func,
    onTestCard: func,
    onOpenDialog: func
  };

  componentDidMount() {
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
      exampleStore.onLoadExamples =
      exampleStore.loadExamples(examples, 100, (mode) => {
        this.setState((state) => ({
          examplesLoaded: {...state.examplesLoaded, [mode]: true}
        }));
      });
    });
  }

  state = {
    examplesLoaded: {
      event: false,
      object: false
    },
    submittedParseIssue: null,
    submittedParseIssueConfirmationOpen: false
  };

  styles = {
    container: {width: '60%', flex: 1, padding: 64},
    paper: {padding: 30, maxWidth: 800, margin: '0 auto'},

    section: {display: 'flex', justifyContent: 'space-between'},

    leftCol: {width: '70%', marginRight: 25},
    rightColContainer: {display: 'flex', alignItems: 'center'},
    rightCol: {width: 210},
    attribute: {width: '100%', marginRight: 25},
    buttonText: {
      fontSize: 14,
      textTransform: 'uppercase',
      fontWeight: '500',
      userSelect: 'none',
      paddingLeft: 16,
      paddingRight: 16,
      color: 'white'
    },
    saveButton: {marginTop: 20},

    icon: {verticalAlign: 'middle', color: 'white'}
  };

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

  get parserMode() {
    return this.props.type === TYPE_EVENT ? 'event' : 'object';
  }

  get parseErrors() {
    return compact(this.nonEmptySentences.map(s => s.result.error)).map(error =>
      (`${error}.`)
        .replace('..', '.')
        .replace('Parser did not produce a valid expression', 'Parser error')
    );
  }

  get nameError() {
    if (!this.props.name || this.props.name === '[Unnamed]') {
      return 'This card needs a name!';
    }
    return null;
  }

  get typeError() {
    if (!CREATABLE_TYPES.includes(this.props.type)) {
      return 'Invalid type.';
    }
    return null;
  }

  get costError() {
    return ensureInRange('cost', this.props.cost, 0, 20);
  }

  get attackError() {
    if (this.robot) {
      return ensureInRange('attack', this.props.attack, 0, 10);
    }
    return null;
  }

  get healthError() {
    if (!this.event) {
      return ensureInRange('health', this.props.health, 1, 10);
    }
    return null;
  }

  get speedError() {
    if (this.robot) {
      return ensureInRange('speed', this.props.speed, 0, 3);
    }
    return null;
  }

  get textError() {
    if (this.event && !this.hasCardText) {
      return 'Events must have card text.';
    } else if (this.parseErrors.length > 0) {
      return this.parseErrors.join(' ');
    } else if (this.nonEmptySentences.find(s => !s.result.js)) {
      return 'Sentences are still being parsed ...';
    } else {
      return null;
    }
  }

  get hasTextError() {
    return this.parseErrors.length > 0;
  }

  get isValid() {
    return !this.nameError && !this.typeError && !this.costError && !this.attackError &&
      !this.healthError && !this.speedError && !this.textError;
  }

  setAttribute = (key) => (value) => {
    this.props.onSetAttribute(key, value);
  };

  handleSetName = (e) => { this.props.onSetName(e.target.value); };

  handleSetType = (e, i, value) => {
    this.props.onSetType(value);
    // Re-parse card text because different card types now have different validations.
    this.onUpdateText(this.props.text, value);
  };

  handleClickHelp = () => {
    this.props.onOpenDialog('help');
  };

  handleClickDictionary = () => {
    this.props.onOpenDialog('dictionary');
  };

  handleClickRandomize = () => {
    const example = exampleStore.getExample(this.parserMode);
    if (example) {
      this.onUpdateText(example, this.props.type, true);
    }
  };

  handleClickReportParseIssue = () => {
    if (this.hasTextError) {
      saveReportedParseIssue(this.props.text);
      this.setState({
        submittedParseIssue: this.props.text,
        submittedParseIssueConfirmationOpen: true
      });
    }
  };

  handleCloseReportParseIssueSnackbar = () => {
    this.setState({ submittedParseIssueConfirmationOpen: false });
  };

  onUpdateText = (text, cardType = this.props.type, dontIndex = false) => {
    const parserMode = cardType === TYPE_EVENT ? 'event' : 'object';
    const sentences = getSentencesFromInput(text);

    this.props.onSetText(text);
    this.setState({ submittedParseIssue: null });
    requestParse(sentences, parserMode, this.props.onParseComplete, !dontIndex);
  };

  renderAttributeField(attribute, enabled = true, opts = {}) {
    return (
      <NumberField
        label={capitalize(attribute)}
        value={this.props[attribute]}
        maxValue={opts.max || 10}
        style={this.styles.attribute}
        disabled={!enabled}
        errorText={this[`${attribute}Error`]}
        onChange={this.setAttribute(attribute)} />
    );
  }

  render() {
    const { submittedParseIssue, submittedParseIssueConfirmationOpen } = this.state;
    const examplesLoaded = this.state.examplesLoaded[this.parserMode];

    const FULL_WIDTH_PERCENT = 100;
    const NUMBER_OF_BUTTONS = 4;
    const MARGIN_PX = 20;

    const buttonMaxWidth = FULL_WIDTH_PERCENT / NUMBER_OF_BUTTONS;
    const buttonPadding = (MARGIN_PX * (NUMBER_OF_BUTTONS - 1)) / NUMBER_OF_BUTTONS;

    return (
      <div style={this.styles.container}>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: MARGIN_PX, width: '100%', maxWidth: 800}}>
            <ButtonInRow
              label="Help"
              icon="help_outline"
              tooltip="Learn more about creating a card."
              width={`calc(${buttonMaxWidth}% - ${buttonPadding}px)`}
              onClick={this.handleClickHelp} />
            <ButtonInRow
              label="Dictionary"
              icon="book"
              tooltip="Check out all of the terms and actions that the parser supports."
              width={`calc(${buttonMaxWidth}% - ${buttonPadding}px)`}
              onClick={this.handleClickDictionary} />
            <ButtonInRow
              label="Randomize"
              icon="refresh"
              tooltip={`Generate random text for the card. ${examplesLoaded ? '' : '(Loading examples ...)'}`}
              onClick={this.handleClickRandomize}
              width={`calc(${buttonMaxWidth}% - ${buttonPadding}px)`}
              disabled={!examplesLoaded} />
            <ButtonInRow
              label="Test"
              icon="videogame_asset"
              tooltip="Test out this card in a practice game."
              onClick={this.props.onTestCard}
              width={`calc(${buttonMaxWidth}% - ${buttonPadding}px)`}
              disabled={!this.isValid} />
          </div>
        </div>

        <Paper style={this.styles.paper}>
          <div style={this.styles.section}>
            <TextField
              value={this.props.name}
              floatingLabelText="Card Name"
              style={this.styles.leftCol}
              errorText={this.nameError}
              onChange={this.handleSetName} />
            <NumberField
              label="Energy Cost"
              value={this.props.cost}
              maxValue={20}
              style={this.styles.rightCol}
              errorText={this.costError}
              onChange={this.setAttribute('cost')} />
          </div>

          <div style={this.styles.section}>
            <SelectField
              value={this.props.type}
              floatingLabelText="Card Type"
              style={{width: 'calc(100% - 60px)'}}
              onChange={this.handleSetType}
            >
              {
                CREATABLE_TYPES.map(type =>
                  <MenuItem key={type} value={type} primaryText={typeToString(type)} />
                )
              }
            </SelectField>
            <div style={this.styles.rightColContainer}>
              <Tooltip text="Generate a new image">
                <RaisedButton
                  primary
                  style={{width: 40, minWidth: 40}}
                  onClick={this.props.onSpriteClick}>
                  <FontIcon className="material-icons" style={this.styles.icon}>refresh</FontIcon>
                </RaisedButton>
              </Tooltip>
            </div>
          </div>

          <div style={this.styles.section}>
            <div style={{flex: 1, marginRight: 20}}>
              <CardTextField
                text={this.props.text}
                sentences={this.nonEmptySentences}
                error={this.textError}
                bigramProbs={this.state && this.state.bigramProbs}
                onUpdateText={this.onUpdateText} />
            </div>
            <div style={this.styles.rightColContainer}>
              <Tooltip text="Having issues getting your card to work? Click here to submit it to us.">
                <RaisedButton
                  secondary
                  style={{width: 40, minWidth: 40}}
                  disabled={!this.hasTextError || !isEmpty(submittedParseIssue)}
                  onClick={this.handleClickReportParseIssue}>
                  <FontIcon className="material-icons" style={this.styles.icon}>report_problem</FontIcon>
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

          <div style={this.styles.section}>
            {this.renderAttributeField('attack', this.robot)}
            {this.renderAttributeField('health', !this.event)}
            {this.renderAttributeField('speed', this.robot, {max: 3})}
          </div>

          <MustBeLoggedIn loggedIn={this.props.loggedIn}>
            <RaisedButton
              primary
              fullWidth
              label={this.props.isNewCard ? 'Add to Collection' : 'Save Edits'}
              disabled={!this.isValid}
              style={this.styles.saveButton}
              onClick={this.props.onAddToCollection} />
          </MustBeLoggedIn>
        </Paper>
      </div>
    );
  }
}
