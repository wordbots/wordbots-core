import React, { Component } from 'react';
import { array, object } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { List } from 'material-ui/List';
import Paper from 'material-ui/Paper';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';
import { capitalize, flatMap, uniq } from 'lodash';

import { KEYWORDS, HINTS, contractKeywords } from '../util/cards';
import StatusIcon from '../components/card/StatusIcon';
import DictionaryTerm from '../components/cards/DictionaryTerm';

export function mapStateToProps(state) {
  const tokens = uniq([].concat(
    Object.keys(state.global.dictionary.definitions),
    Object.keys(state.global.dictionary.examplesByToken)
  )).filter(t => t !== '"' && t !== '\'')
    .sort();

  return {
    tokens: tokens,
    definitionsByToken: state.global.dictionary.definitions,
    examplesByToken: state.global.dictionary.examplesByToken,
    examplesByNode: state.global.dictionary.examplesByNode
  };
}

class Dictionary extends Component {
  static propTypes = {
    tokens: array,
    definitionsByToken: object,
    examplesByToken: object,
    examplesByNode: object,

    history: object
  }

  constructor(props) {
    super(props);

    this.state = {
      tabIdx: 0,
      selectedDictionaryIdx: null,
      selectedThesaurusIdx: null,
      selectedKeywordsIdx: null
    };
  }

  componentWillReceiveProps() {
    if (this.hash) {
      const [ type, term ] = this.hash.split(':');
      if (type === 'd' && this.state.selectedDictionaryIdx === null && this.props.tokens.indexOf(term) > -1) {
        this.setState({
          tabIdx: 0,
          selectedDictionaryIdx: this.props.tokens.indexOf(term)
        });
      } else if (type === 't' && this.state.selectedThesaurusIdx === null && this.thesaurusTerms.indexOf(term) > -1) {
        this.setState({
          tabIdx: 1,
          selectedThesaurusIdx: this.thesaurusTerms.indexOf(term)
        });
      } else if (type === 'k' && this.state.selectedKeywordsIdx === null && this.keywordsTerms.indexOf(term) > -1) {
        this.setState({
          tabIdx: 2,
          selectedKeywordsIdx: this.keywordsTerms.indexOf(term)
        });
      }
    }
  }

  get hash() {
    return this.props.history.location.hash.split('#')[1];
  }

  get dictionaryTerm() {
    return this.props.tokens[this.state.selectedDictionaryIdx || 0] || '';
  }

  get dictionaryDefinitions() {
    return this.props.definitionsByToken[this.dictionaryTerm] || [];
  }

  get dictionaryExamples() {
    const examples = Object.values(this.props.examplesByToken[this.dictionaryTerm] || {});
    return uniq(examples.map(e => e.replace('\n', '')));
  }

  get thesaurusTerms() {
    return flatMap(this.props.examplesByNode, ((nodes, type) => Object.keys(nodes).map(node => `${type}.${node}`)));
  }

  get thesaurusTerm() {
    return this.thesaurusTerms[this.state.selectedThesaurusIdx || 0] || '';
  }

  get thesaurusExamples() {
    const [ type, node ] = this.thesaurusTerm.split('.');
    if (this.props.examplesByNode && this.props.examplesByNode[type] && this.props.examplesByNode[type][node]) {
      const examples = Object.values(this.props.examplesByNode[type][node]);
      return uniq(examples.map(e => e.replace('\n', '')));
    } else {
      return [];
    }
  }

  get keywords() {
    return Object.assign({}, KEYWORDS, HINTS);
  }

  get keywordsTerms() {
    return Object.keys(this.keywords).sort().map(k => capitalize(k));
  }

  get keywordsTerm() {
    return this.keywordsTerms[this.state.selectedKeywordsIdx || 0] || '';
  }

  get keywordsDefinition() {
    return this.keywords[this.keywordsTerm.toLowerCase()];
  }

  setHash() {
    if (this.state.tabIdx === 0) {
      this.props.history.push(`${this.props.history.location.pathname}#d:${this.dictionaryTerm}`);
    } else if (this.state.tabIdx === 1) {
      this.props.history.push(`${this.props.history.location.pathname}#t:${this.thesaurusTerm}`);
    } else if (this.state.tabIdx === 2) {
      this.props.history.push(`${this.props.history.location.pathname}#k:${this.keywordsTerm}`);
    }
  }

  renderSidebar(tokens, selectedIdx, type) {
    return (
      <div style={{width: '20%'}}>
        <Paper style={{
          overflowY: 'scroll',
          height: '65vh'
        }}>
          <List>
          {tokens.map((token, idx) =>
            <DictionaryTerm
              key={token}
              token={token.replace(' \'', '\'')}
              selected={idx === (selectedIdx || 0)}
              onClick={() => {
                const idxKey = ['selectedDictionaryIdx', 'selectedThesaurusIdx', 'selectedKeywordsIdx'][this.state.tabIdx];
                this.setState({[idxKey]: idx}, this.setHash.bind(this));
              }} />
          )}
          </List>
        </Paper>
      </div>
    );
  }

  renderDictionary() {
    return (
      <div style={{display: 'flex', justifyContent: 'stretch'}}>
        <Helmet title={this.hash.includes('d:') ? `Dictionary: ${this.hash.split(':')[1]}` : 'Dictionary'}/>

        {this.renderSidebar(this.props.tokens, this.state.selectedDictionaryIdx, 'dictionary')}

        <div style={{width: '80%'}}>
          <Paper style={{height: '65vh'}}>
            <Toolbar>
              <ToolbarGroup>
                <ToolbarTitle text={this.dictionaryTerm.replace(' \'', '\'')} />
              </ToolbarGroup>
            </Toolbar>

            <div style={{padding: 20, height: 'calc(100% - 56px)', overflowY: 'auto', boxSizing: 'border-box'}}>
              <span style={{fontSize: 24, fontWeight: 100}}>Definitions</span>
              <ol>
                {this.dictionaryDefinitions.map(d =>
                  <li>
                    <strong>{d.syntax}. </strong>
                    {d.semantics.replace(/=>/g, '→').replace(/\,(\w)/g, '\, $1')}
                  </li>
                )}
              </ol>

              <span style={{fontSize: 24, fontWeight: 100}}>Examples</span>
              <ul>
                {this.dictionaryExamples.map(e =>
                  <li>
                    {contractKeywords(e)}.&nbsp;
                    {StatusIcon(e, {parsed: true})}
                  </li>
                )}
              </ul>
            </div>
          </Paper>
        </div>
      </div>
    );
  }

  renderThesaurus() {
    return (
      <div style={{display: 'flex', justifyContent: 'stretch'}}>
        <Helmet title={this.hash.includes('t:') ? `Thesaurus: ${this.hash.split(':')[1]}` : 'Thesaurus'}/>

        {this.renderSidebar(this.thesaurusTerms, this.state.selectedThesaurusIdx, 'thesaurus')}

        <div style={{width: '80%'}}>
          <Paper style={{height: '65vh'}}>
            <Toolbar>
              <ToolbarGroup>
                <ToolbarTitle text={this.thesaurusTerm} />
              </ToolbarGroup>
            </Toolbar>

            <div style={{padding: 20, height: 'calc(100% - 56px)', overflowY: 'auto', boxSizing: 'border-box'}}>
              <span style={{fontSize: 24, fontWeight: 100}}>Examples</span>
              <ul>
                {this.thesaurusExamples.map(e =>
                  <li>
                    {contractKeywords(e)}.&nbsp;
                    {StatusIcon(e, {parsed: true})}
                  </li>
                )}
              </ul>
            </div>
          </Paper>
        </div>
      </div>
    );
  }

  renderKeywords() {
    return (
      <div style={{display: 'flex', justifyContent: 'stretch'}}>
        <Helmet title={this.hash.includes('k:') ? `Keywords: ${this.hash.split(':')[1]}` : 'Keywords'}/>

        {this.renderSidebar(this.keywordsTerms, this.state.selectedKeywordsIdx, 'keywords')}

        <div style={{width: '80%'}}>
          <Paper style={{height: '65vh'}}>
            <Toolbar>
              <ToolbarGroup>
                <ToolbarTitle text={this.keywordsTerm} />
              </ToolbarGroup>
            </Toolbar>

            <div style={{padding: 20, height: 'calc(100% - 56px)', overflowY: 'auto', boxSizing: 'border-box'}}>
              <span style={{fontSize: 24, fontWeight: 100}}>Definition</span>
              <p>
                {this.keywordsDefinition}
              </p>
            </div>
          </Paper>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <div>
          <div style={{marginBottom: 15}}>
            This dictionary is automatically generated based on cards that players create.
            As more cards are created, the dictionary will become more and more comprehensive!
          </div>

          <Tabs
            value={this.state.tabIdx}
            onChange={(idx) => {
              this.setState({tabIdx: idx}, this.setHash.bind(this));
          }}>
            <Tab label="Dictionary" value={0}>
              <div>
                {this.renderDictionary()}
              </div>
            </Tab>
            <Tab label="Thesaurus" value={1}>
              <div>
                {this.renderThesaurus()}
              </div>
            </Tab>
            <Tab label="Keywords" value={2}>
              <div>
                {this.renderKeywords()}
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps)(Dictionary));
