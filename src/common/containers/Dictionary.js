import React, { Component } from 'react';
import { array, object } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Paper from 'material-ui/Paper';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';
import { List, ListItem } from 'material-ui/List';
import { uniq } from 'lodash';

import StatusIcon from '../components/card/StatusIcon';

export function mapStateToProps(state) {
  const tokens = uniq([].concat(
    Object.keys(state.global.dictionary.definitions),
    Object.keys(state.global.dictionary.examplesByToken)
  )).sort();

  return {
    tokens: tokens,
    definitionsByToken: state.global.dictionary.definitions,
    examplesByToken: state.global.dictionary.examplesByToken
  };
}

class Dictionary extends Component {
  static propTypes = {
    tokens: array,
    definitionsByToken: object,
    examplesByToken: object,

    history: object
  }

  constructor(props) {
    super(props);

    this.state = {
      selectedIdx: null
    };
  }

  shouldComponentUpdate() {
    if (this.hash && this.state.selectedIdx === null && this.props.tokens.indexOf(this.hash) > -1) {
      this.setState({selectedIdx: this.props.tokens.indexOf(this.hash)});
    }
    return true;
  }

  get hash() {
    return this.props.history.location.hash.split('#')[1];
  }

  get token() {
    return this.props.tokens[this.state.selectedIdx || 0] || '';
  }

  get definitions() {
    return this.props.definitionsByToken[this.token] || [];
  }

  get examples() {
    const examples = Object.values(this.props.examplesByToken[this.token] || {});
    return uniq(examples.map(e => e.replace('\n', '')));
  }

  render() {
    return (
      <div>
        <Helmet title={this.hash ? `Dictionary: ${this.hash}` : 'Dictionary'}/>

        <div>
          <div style={{marginBottom: 15}}>
            This dictionary is automatically generated based on cards that players create.
            As more cards are created, the dictionary will become more and more comprehensive!
          </div>

          <Toolbar style={{backgroundColor: '#f44336'}}>
            <ToolbarGroup>
              <ToolbarTitle text="Dictionary" style={{color: 'white'}} />
            </ToolbarGroup>
          </Toolbar>

          <div style={{display: 'flex', justifyContent: 'stretch'}}>
            <div style={{width: '20%'}}>
              <Paper style={{
                overflowY: 'scroll',
                height: '65vh'
              }}>
                <List>
                {this.props.tokens.map((token, idx) =>
                  <ListItem
                    primaryText={token.replace(' \'', '\'')}
                    onTouchTap={() => {
                      this.setState({selectedIdx: idx});
                      this.props.history.push(`${this.props.history.location.pathname}#${token}`);
                    }}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: idx === (this.state.selectedIdx || 0) ? '#ddd' : '#fff'
                    }} />
                )}
                </List>
              </Paper>
            </div>

            <div style={{width: '80%'}}>
              <Paper style={{height: '65vh'}}>
                <Toolbar>
                  <ToolbarGroup>
                    <ToolbarTitle text={this.token.replace(' \'', '\'')} />
                  </ToolbarGroup>
                </Toolbar>

                <div style={{padding: 20, height: 'calc(100% - 56px)', overflowY: 'auto', boxSizing: 'border-box'}}>
                  <span style={{fontSize: 24, fontWeight: 100}}>Definitions</span>
                  <ol>
                    {this.definitions.map(d =>
                      <li>
                        <strong>{d.syntax}. </strong>
                        {d.semantics.replace(/=>/g, '→').replace(/\,(\w)/g, '\, $1')}
                      </li>
                    )}
                  </ol>

                  <span style={{fontSize: 24, fontWeight: 100}}>Examples</span>
                  <ul>
                    {this.examples.map(e =>
                      <li>
                        {e}.&nbsp;
                        {StatusIcon(e, {parsed: true})}
                      </li>
                    )}
                  </ul>
                </div>
              </Paper>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps)(Dictionary));
