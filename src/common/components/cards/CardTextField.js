import React, { Component } from 'react';
import { array, func, string } from 'prop-types';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { chain as _ } from 'lodash';

import { bigramNLL, prepareBigramProbs } from '../../util/common';
import { getCardTextCorpus } from '../../util/firebase';

export default class CardTextField extends Component {
  static propTypes = {
    text: string,
    sentences: array,
    error: string,

    onUpdateText: func,
    onOpenDialog: func
  };

  componentDidMount() {
    getCardTextCorpus(corpus => {
      this.setState({ bigramProbs: prepareBigramProbs(corpus) });
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
            rows={2}
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
              style={{width: '100%'}}
              onClick={() => { this.props.onOpenDialog('dictionary'); }} />
          </div>
        </div>

        {this.renderTextErrors()}
      </div>
    );
  }
}
