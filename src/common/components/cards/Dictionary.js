import React, { Component } from 'react';
import { object } from 'prop-types';
import Helmet from 'react-helmet';
import Paper from 'material-ui/Paper';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';
import { capitalize, mapKeys, uniq } from 'lodash';

import { allKeywords, contractKeywords } from '../../util/cards';
import StatusIcon from '../card/StatusIcon';

import DictionarySearchBar from './DictionarySearchBar';
import DictionarySidebar from './DictionarySidebar';

export default class Dictionary extends Component {
  static propTypes = {
    dictionaryDefinitions: object,
    dictionaryExamples: object,
    thesaurusExamples: object
  }

  constructor(props) {
    super(props);

    this.state = {
      tabIdx: 0,
      dictionaryTerm: null,
      thesaurusTerm: null,
      keywordsTerm: null,
      searchText: ''
    };
  }

  get currentTab() {
    return ['dictionary', 'thesaurus', 'keywords'][this.state.tabIdx];
  }
  get currentTerm() {
    return (this.state[`${this.currentTab}Term`] || this[`${this.currentTab}Terms`][0]);
  }

  get dictionaryTerms() {
    return Object.keys(this.dictionaryDefinitions)
                 .filter(t => t.includes(this.state.searchText) && t !== '"' && t !== '\'')
                 .sort();
  }
  get dictionaryDefinitions() {
    return mapKeys(this.props.dictionaryDefinitions, (def, term) => term.replace(' \'', '\'')); // e.g. "robot 's" => "robot's"
  }

  get thesaurusTerms() {
    return Object.keys(this.props.thesaurusExamples)
                 .filter(t => t.includes(this.state.searchText))
                 .sort();
  }

  get keywordsTerms() {
    return Object.keys(allKeywords())
                 .filter(t => t.includes(this.state.searchText))
                 .sort()
                 .map(k => capitalize(k));
  }

  selectTerm = (term) => {
    this.setState({ [`${this.currentTab}Term`]: term });
  }

  cleanupExample = (example) => (
    capitalize(contractKeywords(example).trim()).replace(/,$/, '')
  )
  cleanupSemantics = (semantics) => (
    semantics.replace(/=>/g, '→').replace(/scala\./g, '').replace(/\,(\w)/g, '\, $1')
  )

  renderTitle() {
    return (
      <div>
        <Helmet title={`${capitalize(this.currentTab)} : ${this.currentTerm}`} />
        <Toolbar>
          <ToolbarGroup>
            <ToolbarTitle text={this.currentTerm} />
          </ToolbarGroup>
        </Toolbar>
      </div>
    );
  }

  renderPage() {
    return [
      [this.renderDictionaryDefinitions(), this.renderExamples(this.props.dictionaryExamples, this.currentTerm)],
      this.renderExamples(this.props.thesaurusExamples, this.currentTerm),
      this.renderKeywordsDefinition()
    ][this.state.tabIdx];
  }

  renderExamples(examplesByTerm, term) {
    if (examplesByTerm[term]) {
      const examples = uniq(examplesByTerm[term].map(this.cleanupExample));
      return (
        <div key="examples">
          <span style={{fontSize: 24, fontWeight: 100}}>Examples</span>
          <ul>
            {examples.map(example =>
              <li key={example}>
                {example}.&nbsp;{StatusIcon(example, {parsed: true})}
              </li>
            )}
          </ul>
        </div>
      );
    }
  }

  renderDictionaryDefinitions() {
    const definitions = this.dictionaryDefinitions[this.currentTerm] || [];
    return (
      <div key="definitions">
        <span style={{fontSize: 24, fontWeight: 100}}>Definitions</span>
        <ol>
          {definitions.map(d =>
            <li key={`${d.syntax}${d.semantics}`}>
              <strong>{d.syntax}. </strong>{this.cleanupSemantics(d.semantics)}
            </li>
          )}
        </ol>
      </div>
    );
  }

  renderKeywordsDefinition() {
    const term = this.currentTerm ? this.currentTerm.toLowerCase() : null;
    const definition = allKeywords()[term];
    if (definition) {
      return (
        <div key="definition">
          <span style={{fontSize: 24, fontWeight: 100}}>Definition</span>
          <p>
            {definition.endsWith(',') ? `${definition} [...] .` : definition}
          </p>
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        <div>
          <div style={{marginBottom: 15}}>
            This dictionary is automatically generated based on cards that players create.
            As more cards are created, the dictionary will become more and more comprehensive!
          </div>

          <div style={{display: 'flex', backgroundColor: 'rgb(0, 188, 212)'}}>
            <Tabs
              value={this.state.tabIdx}
              onChange={(tabIdx) => { this.setState({ tabIdx }); }}
              style={{width: '80%'}}
              inkBarStyle={{backgroundColor: '#eee', height: 4, marginTop: -4}}
            >
              <Tab label={`Dictionary (${this.dictionaryTerms.length})`} value={0} />
              <Tab label={`Thesaurus (${this.thesaurusTerms.length})`} value={1} />
              <Tab label={`Keywords (${this.keywordsTerms.length})`} value={2} />
            </Tabs>

            <DictionarySearchBar
              onChange={(searchText) => this.setState({ searchText })} />
          </div>

          <div style={{display: 'flex', justifyContent: 'stretch', marginTop: 8}}>
            <DictionarySidebar
              terms={this[`${this.currentTab}Terms`]}
              selectedTerm={this.currentTerm}
              onClick={this.selectTerm} />

            <div style={{width: '80%'}}>
              <Paper style={{height: '65vh'}}>
                {this.renderTitle()}

                <div style={{padding: 20, height: 'calc(100% - 56px)', overflowY: 'auto', boxSizing: 'border-box'}}>
                  {this.renderPage()}
                </div>
              </Paper>
            </div>
            </div>
        </div>
      </div>
    );
  }
}
