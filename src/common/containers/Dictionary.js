import React, { Component } from 'react';
import { array, object } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Paper from 'material-ui/Paper';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';
import { List, ListItem } from 'material-ui/List';
import { uniq } from 'lodash';

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
    examplesByToken: object
  }

  constructor(props) {
    super(props);

    this.state = {
      selectedIdx: 0
    };
  }

  get token() {
    return this.props.tokens[this.state.selectedIdx];
  }

  get definitions() {
    return this.props.definitionsByToken[this.token] || [];
  }

  get examples() {
    return uniq(Object.values(this.props.examplesByToken[this.token] || {}));
  }

  render() {
    return (
      <div style={{margin: '48px 72px'}}>
        <Helmet title="Dictionary"/>

        <div style={{marginTop: 20}}>
          <Toolbar style={{backgroundColor: '#f44336'}}>
            <ToolbarGroup>
              <ToolbarTitle text="Dictionary" style={{color: 'white'}} />
            </ToolbarGroup>
          </Toolbar>
          <div style={{display: 'flex', justifyContent: 'stretch'}}>
            <div style={{width: '20%'}}>
              <Paper style={{
                overflowY: 'scroll',
                height: '80vh'
              }}>
                <List>
                {this.props.tokens.map((t, idx) =>
                  <ListItem
                    primaryText={t}
                    onTouchTap={() => this.setState({selectedIdx: idx})}
                    style={{
                      cursor: 'pointer',
                      fontWeight: idx === this.state.selectedIdx ? 'bold' : 'normal'
                    }} />
                )}
                </List>
              </Paper>
            </div>

            <div style={{width: '80%'}}>
              <Paper style={{height: '80vh'}}>
                <Toolbar>
                  <ToolbarGroup>
                    <ToolbarTitle text={this.token} />
                  </ToolbarGroup>
                </Toolbar>

                <div style={{padding: 20, height: 'calc(100% - 56px)', overflowY: 'auto', boxSizing: 'border-box'}}>
                  <b>Definitions:</b>
                  <ol>
                    {this.definitions.map(d =>
                      <li>
                        <div>Syntax: {d.syntax}.</div>
                        <div>Semantics: {d.semantics}</div>
                      </li>
                    )}
                  </ol>

                  <b>Examples:</b>
                  <ul>
                    {this.examples.map(e => <li>{e}.</li>)}
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
