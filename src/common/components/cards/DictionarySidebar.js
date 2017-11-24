import React, { Component } from 'react';
import { arrayOf, func, string } from 'prop-types';
import Paper from 'material-ui/Paper';
import { List } from 'material-ui/List';

import DictionaryTerm from './DictionaryTerm';

export default class DictionarySidebar extends Component {
  static propTypes = {
    terms: arrayOf(string),
    selectedTerm: string,
    onClick: func
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.terms !== this.props.terms;
  }

  renderTerm = (term) => (
    <DictionaryTerm
      key={term}
      token={term}
      selected={term === this.props.selectedTerm}
      onClick={this.props.onClick} />
  );

  render() {
    return (
      <div>
        <Paper style={{
          overflowY: 'scroll',
          height: '65vh'
        }}>
          <List style={{padding: 0}}>
            {this.props.terms.map(this.renderTerm)}
          </List>
        </Paper>
      </div>
    );
  }
}
