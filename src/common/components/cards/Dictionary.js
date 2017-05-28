import React, { Component } from 'react';
import { object } from 'prop-types';
import Helmet from 'react-helmet';
import Paper from 'material-ui/Paper';
import {Tabs, Tab} from 'material-ui/Tabs';
import Divider from 'material-ui/Divider';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { capitalize, noop } from 'lodash';

import { allKeywords, contractKeywords } from '../../util/cards';
import StatusIcon from '../card/StatusIcon';

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
      dictionaryIdx: null,
      thesaurusIdx: null,
      keywordsIdx: null,
      searchText: ''
    };
  }

  get currentTab() {
    return ['dictionary', 'thesaurus', 'keywords'][this.state.tabIdx];
  }

  get dictionaryTerms() {
    return Object.keys(this.props.dictionaryDefinitions).filter(t => t !== '"' && t !== '\'').sort();
  }
  get dictionaryTerm() {
    return this.dictionaryTerms[this.state.dictionaryIdx || 0] || '';
  }

  get thesaurusTerms() {
    return Object.keys(this.props.thesaurusExamples).sort();
  }
  get thesaurusTerm() {
    return this.thesaurusTerms[this.state.thesaurusIdx || 0] || '';
  }

  get keywordsTerms() {
    return Object.keys(allKeywords()).sort().map(k => capitalize(k));
  }
  get keywordsTerm() {
    return this.keywordsTerms[this.state.keywordsIdx || 0] || '';
  }

  changeTab(idx, callback = noop) {
    this.setState({
      tabIdx: idx,
      searchText: ''
    }, callback);
  }

  selectTerm(idx) {
    this.setState({ [`${this.currentTab}Idx`]: idx });
  }

  renderTitle() {
    const term = this[`${this.currentTab}Term`].replace(' \'', '\'');  // e.g. "robot 's" => "robot's"
    return (
      <div>
        <Helmet title={`${capitalize(this.currentTab)} : ${term}`} />
        <Toolbar>
          <ToolbarGroup>
            <ToolbarTitle text={term} />
          </ToolbarGroup>
        </Toolbar>
      </div>
    );
  }

  renderPage() {
    return [
      [this.renderDictionaryDefinitions(), this.renderExamples(this.props.dictionaryExamples, this.dictionaryTerm)],
      this.renderExamples(this.props.thesaurusExamples, this.thesaurusTerm),
      this.renderKeywordsDefinition()
    ][this.state.tabIdx];
  }

  renderExamples(examples, term) {
    if (examples[term]) {
      return (
        <div key="examples">
          <span style={{fontSize: 24, fontWeight: 100}}>Examples</span>
          <ul>
            {examples[term].map(e =>
              <li key={e}>
                {contractKeywords(e)}.&nbsp;{StatusIcon(e, {parsed: true})}
              </li>
            )}
          </ul>
        </div>
      );
    }
  }

  renderDictionaryDefinitions() {
    const definitions = this.props.dictionaryDefinitions[this.dictionaryTerm] || [];
    return (
      <div key="definitions">
        <span style={{fontSize: 24, fontWeight: 100}}>Definitions</span>
        <ol>
          {definitions.map(d =>
            <li key={`${d.syntax}${d.semantics}`}>
              <strong>{d.syntax}. </strong>
              {d.semantics.replace(/=>/g, '→').replace(/scala\./g, '').replace(/\,(\w)/g, '\, $1')}
            </li>
          )}
        </ol>
      </div>
    );
  }

  renderKeywordsDefinition() {
    const definition = allKeywords()[this.keywordsTerm.toLowerCase()];
    return (
      <div key="definition">
        <span style={{fontSize: 24, fontWeight: 100}}>Definition</span>}
        <p>
          {definition.endsWith(',') ? `${definition} [...] .` : definition}
        </p>
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

          <div style={{display: 'flex', backgroundColor: 'rgb(0, 188, 212)'}}>
            <Tabs
              value={this.state.tabIdx}
              onChange={(idx) => { this.changeTab(idx); }}
              style={{width: '80%'}}
            >
              <Tab label="Dictionary" value={0} />
              <Tab label="Thesaurus" value={1} />
              <Tab label="Keywords" value={2} />
            </Tabs>

            <TextField
              value={this.state.searchText}
              hintText="Search for a term ... "
              style={{width: '20%', margin: '0 10px'}}
              hintStyle={{color: '#eee'}}
              inputStyle={{color: '#eee'}}
              onChange={(e) => { this.setState({searchText: e.target.value}); }} />
          </div>

          <div style={{display: 'flex', justifyContent: 'stretch', marginTop: 8}}>
            <DictionarySidebar
              terms={this[`${this.currentTab}Terms`]}
              searchText={this.state.searchText}
              selectedIdx={this.state[`${this.currentTab}Idx`]}
              onClick={(idx) => { this.selectTerm(idx); }} />

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
