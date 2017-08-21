import React, { Component } from 'react';
import { array, func, number, string } from 'prop-types';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import { chain as _ } from 'lodash';

import { TYPE_EVENT } from '../../constants';
import { bigramNLL, prepareBigramProbs } from '../../util/common';
import { CardTextExampleStore } from '../../util/cards';
import { getCardTextCorpus } from '../../util/firebase';

const exampleStore = new CardTextExampleStore();

export default class CardTextField extends Component {
  static propTypes = {
    type: number,
    text: string,
    sentences: array,
    error: string,

    onUpdateText: func,
    onOpenDialog: func
  };

  componentDidMount() {
    getCardTextCorpus((corpus, examples) => {
      this.setState({
        bigramProbs: prepareBigramProbs(corpus)
      });
      exampleStore.loadExamples(examples, 100);
    });
  }

  get parserMode() {
    return this.props.type === TYPE_EVENT ? 'event' : 'object';
  }

  get textSuggestions() {
    if (this.state && this.state.bigramProbs) {
      return _(this.props.sentences)
              .flatMap(s => (s.result.suggestions || []).map(sugg => ({ original: s.sentence.trim(), new: sugg })))
              .sortBy(suggestion => bigramNLL(suggestion.new, this.state.bigramProbs))
              .slice(0, 5)
              .value();
    } else {
      return [];
    }
  }

  useSuggestion = (suggestion) => {
    this.props.onUpdateText(this.props.text.replace(suggestion.original, suggestion.new));
  }

  renderSuggestion = (suggestion) => (
    <span key={suggestion.new}>
      &nbsp;
      <a
        onClick={() => { this.useSuggestion(suggestion); }}
        style={{cursor: 'pointer', textDecoration: 'underline'}}
      >
        {suggestion.new}
      </a>
      &nbsp;
    </span>
  )

  renderDidYouMean = () => {
    if (this.textSuggestions.length > 0) {
      return (
        <div style={{marginTop: 5}}>
          Did you mean: {this.textSuggestions.map(this.renderSuggestion)} ?
        </div>
      );
    }
  }

  renderTextErrors = () => {
    if (this.props.error) {
      return (
        <div style={{
          fontSize: 12,
          lineHeight: '12px',
          color: 'rgb(244, 67, 54)'
        }}>
          <div>
            {this.props.error}
          </div>
          {this.renderDidYouMean()}
        </div>
      );
    }
  }

  renderButton = (label, icon, onClick) => (
    <RaisedButton
      label={label}
      primary
      style={{width: '100%', marginBottom: 8}}
      onClick={onClick}
    >
      <FontIcon className="material-icons" style={{verticalAlign: 'middle', color: 'white'}}>
        {icon}
      </FontIcon>
    </RaisedButton>
  )

  render() {
    return (
      <div>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div style={{width: 'calc(100% - 170px)', marginRight: 15}}>
            <TextField
              multiLine
              value={this.props.text}
              floatingLabelText="Card Text"
              style={{width: '100%'}}
              rows={4}
              onChange={e => { this.props.onUpdateText(e.target.value); }} />
          </div>

          <div style={{width: 170}}>
            {this.renderButton('Help', 'help_outline', () => {
              this.props.onOpenDialog('help');
            })}
            {this.renderButton('Dictionary', 'book', () => {
              this.props.onOpenDialog('dictionary');
            })}
            {this.renderButton('Randomize', 'refresh', () => {
              this.props.onUpdateText(exampleStore.getExample(this.parserMode), this.props.type, true);
            })}
          </div>
        </div>

        {this.renderTextErrors()}
      </div>
    );
  }
}
