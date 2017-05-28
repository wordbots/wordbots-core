import React, { Component } from 'react';
import { array, func, number, string } from 'prop-types';
import Paper from 'material-ui/Paper';
import { List } from 'material-ui/List';

import DictionaryTerm from './DictionaryTerm';

export default class DictionarySidebar extends Component {
  static propTypes = {
    terms: array,
    searchText: string,
    selectedIdx: number,
    onClick: func
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.terms !== this.props.terms;
  }

  get terms() {
    return this.props.terms.map(t => t.replace(' \'', '\''));
  }

  renderTerm(term, idx) {
    if (!this.props.searchText || term.toLowerCase().includes(this.props.searchText.toLowerCase())) {
      return (
        <DictionaryTerm
          key={term}
          token={term}
          selected={idx === (this.props.selectedIdx || 0)}
          onClick={() => this.props.onClick(idx)} />
      );
    }
  }

  render() {
    return (
      <div style={{width: '20%'}}>
        <Paper style={{
          overflowY: 'scroll',
          height: '65vh'
        }}>
          <List style={{padding: 0}}>
            {this.terms.map((term, idx) => this.renderTerm(term, idx))}
          </List>
        </Paper>
      </div>
    );
  }
}
