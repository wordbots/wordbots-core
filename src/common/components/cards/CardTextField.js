import React, { Component } from 'react';
import { array, func, number, string } from 'prop-types';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { chain as _, capitalize, sample, shuffle } from 'lodash';

import { TYPE_EVENT } from '../../constants';
import { bigramNLL, prepareBigramProbs } from '../../util/common';
import { parse } from '../../util/cards';
import { getCardTextCorpus } from '../../util/firebase';

const cardTextExamples = {
  event: [],
  object: []
};

function findValidCardTextExamples(candidates) {
  shuffle(candidates)
    .map(capitalize)
    .slice(0, 50)
    .forEach(example => {
      ['event', 'object'].forEach(mode => {
        parse([example], mode, (idx, s, json) => {
          if (!json.error) {
            cardTextExamples[mode].push(example);
          }
        }, false);
      });
    });
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
      findValidCardTextExamples(examples);
    });
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
            <RaisedButton
              label="Help"
              primary
              style={{width: '100%', marginBottom: 8}}
              onClick={() => { this.props.onOpenDialog('help'); }} />
            <RaisedButton
              label="Dictionary"
              primary
              style={{width: '100%', marginBottom: 8}}
              onClick={() => { this.props.onOpenDialog('dictionary'); }} />
            <RaisedButton
              label="Randomize"
              primary
              style={{width: '100%'}}
              onClick={() => {
                const parserMode = this.props.type === TYPE_EVENT ? 'event' : 'object';
                this.props.onUpdateText(sample(cardTextExamples[parserMode]), this.props.type, true);
              }} />
          </div>
        </div>

        {this.renderTextErrors()}
      </div>
    );
  }
}
