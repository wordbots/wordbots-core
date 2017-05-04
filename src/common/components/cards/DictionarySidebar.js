import React, { Component } from 'react';
import { array, func, number } from 'prop-types';
import Paper from 'material-ui/Paper';
import { List } from 'material-ui/List';

import DictionaryTerm from './DictionaryTerm';

export default class DictionarySidebar extends Component {
  static propTypes = {
    terms: array,
    selectedIdx: number,
    onClick: func
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.terms !== this.props.terms;
  }

  render() {
    return (
      <div style={{width: '20%'}}>
        <Paper style={{
          overflowY: 'scroll',
          height: '65vh'
        }}>
          <List>
            {this.props.terms.map((token, idx) =>
              <DictionaryTerm
                key={token}
                token={token.replace(' \'', '\'')}
                selected={idx === (this.props.selectedIdx || 0)}
                onClick={() => this.props.onClick(idx)} />
            )}
          </List>
        </Paper>
      </div>
    );
  }
}
