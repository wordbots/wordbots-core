import React, { Component } from 'react';
import { array, func, number, string } from 'prop-types';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { chain as _, capitalize, sample, shuffle, times } from 'lodash';

import { TYPE_EVENT } from '../../constants';
import { bigramNLL, prepareBigramProbs } from '../../util/common';
import { parse } from '../../util/cards';
import { getCardTextCorpus } from '../../util/firebase';

const NUM_EXAMPLES_TO_CHECK = 100;
const EXAMPLE_LOOKUP_INTERVAL_MS = 500;

const cardTextExamples = {
  event: [],
  object: []
};

function findValidCardTextExamples(examples) {
  const candidates = shuffle(examples).map(capitalize);

  let i = 0;

  function tryNext() {
    const candidate = candidates[i];
    if (candidate && !candidate.startsWith('"')) {
      ['event', 'object'].forEach(mode => {
        parse([candidate], mode, (idx, s, json) => {
          if (!json.error) {
            cardTextExamples[mode].push(candidate);
          }
        }, false);
      });
    }
    i++;
  }

  times(5, tryNext);
  setInterval(tryNext, EXAMPLE_LOOKUP_INTERVAL_MS);
}

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
      findValidCardTextExamples(examples.slice(0, NUM_EXAMPLES_TO_CHECK));
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

  renderButton = (label, onClick) => (
    <RaisedButton
      label={label}
      primary
      style={{width: '100%', marginBottom: 8}}
      onClick={onClick} />
  )

  render() {
    return (
      <div>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <TextField
            multiLine
            value={this.props.text}
            floatingLabelText="Card Text"
            style={{width: '85%', marginRight: 10}}
            rows={4}
            onChange={e => { this.props.onUpdateText(e.target.value); }} />

          <div>
            {this.renderButton('Help', () => {
              this.props.onOpenDialog('help');
            })}
            {this.renderButton('Dictionary', () => {
              this.props.onOpenDialog('dictionary');
            })}
            {this.renderButton('Randomize', () => {
              console.log(cardTextExamples);
              this.props.onUpdateText(sample(cardTextExamples[this.parserMode]), this.props.type, true);
            })}
          </div>
        </div>

        {this.renderTextErrors()}
      </div>
    );
  }
}
