import React, { Component } from 'react';
import { array, object } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Paper from 'material-ui/Paper';
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
    const paperStyle = {
      height: '80vh',
      padding: '5px 20px',
      overflowY: 'scroll'
    };

    return (
      <div style={{margin: '48px 72px'}}>
        <Helmet title="Dictionary"/>

        <div style={{display: 'flex', justifyContent: 'stretch', marginTop: 20}}>
          <div style={{width: '30%'}}>
            <Paper style={paperStyle}>
              {this.props.tokens.map((t, idx) =>
                <div
                  onTouchTap={() => { this.setState({selectedIdx: idx}); }}
                  style={{
                    cursor: 'pointer',
                    fontWeight: idx === this.state.selectedIdx ? 'bold' : 'normal'
                }}>
                  {t}
                </div>
              )}
            </Paper>
          </div>

          <div style={{width: '70%'}}>
            <Paper style={paperStyle}>
              <div style={{
                fontWeight: 700,
                fontSize: 20,
                marginBottom: 10
              }}>{this.token}</div>

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
            </Paper>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps)(Dictionary));
