import React, { Component } from 'react';
import { object } from 'prop-types';
import Helmet from 'react-helmet';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';
import { capitalize, mapKeys, noop, uniq } from 'lodash';

import { getHash, setHash } from '../../util/common';
import { allKeywords, contractKeywords } from '../../util/cards';
import { listenToDictionaryData } from '../../util/firebase';
import RouterDialog from '../RouterDialog';
import StatusIcon from '../card/StatusIcon';

import DictionarySearchBar from './DictionarySearchBar';
import DictionarySidebar from './DictionarySidebar';

export default class DictionaryDialog extends Component {
  static propTypes = {
    history: object
  }

  constructor(props) {
    super(props);

    this.state = {
      dictionary: {
        definitions: {},
        examplesByToken: {},
        examplesByNode: {}
      },
      tabIdx: 0,
      dictionaryTerm: null,
      thesaurusTerm: null,
      keywordsTerm: null,
      searchText: ''
    };
  }

  componentWillMount() {
    const hash = getHash(this.props.history);
    if (hash) {
      const [ type, term ] = hash.split(':');

      this.setState({ tabIdx: 'dtk'.indexOf(type) }, () => {
        this.selectTerm(term);
      });
    }
  }

  componentDidMount() {
    listenToDictionaryData(data => {
      this.setState({
        dictionary: Object.assign({}, this.state.dictionary, data.dictionary)
      });
    });
  }

  get currentTab() {
    return ['dictionary', 'thesaurus', 'keywords'][this.state.tabIdx];
  }
  get currentTabTerms() {
    return this[`${this.currentTab}Terms`];
  }
  get selectedTerm() {
    return (this.state[`${this.currentTab}Term`] || this.currentTabTerms[0]);
  }

  get dictionaryTerms() {
    return Object.keys(this.dictionaryDefinitions)
                 .filter(t => t.includes(this.state.searchText) && t !== '"' && t !== '\'')
                 .sort();
  }
  get dictionaryDefinitions() {
    return this.cleanupTerms(this.state.dictionary.definitions);
  }
  get dictionaryExamples() {
    return this.cleanupTerms(this.state.dictionary.examplesByToken);
  }

  get thesaurusTerms() {
    return Object.keys(this.thesaurusExamples)
                 .filter(t => t.includes(this.state.searchText))
                 .sort();
  }
  get thesaurusExamples() {
    return this.state.dictionary.examplesByNode;
  }

  get keywordsTerms() {
    return Object.keys(allKeywords())
                 .filter(t => t.includes(this.state.searchText))
                 .sort()
                 .map(k => capitalize(k));
  }

  cleanupTerms = (obj) => (
    mapKeys(obj, (value, term) => term.replace(' \'', '\''))
  )
  cleanupExample = (example) => (
    capitalize(contractKeywords(example).trim())
      .replace(/,$/, '')
      .replace('activate:', 'Activate:')
  )
  cleanupSemantics = (semantics) => (
    semantics.replace(/=>/g, '→').replace(/scala\./g, '').replace(/\,(\w)/g, '\, $1')
  )

  selectTerm = (term, callback = noop) => {
    this.setState({ [`${this.currentTab}Term`]: term }, callback);
  }

  updateHash = () => {
    const tabKey = this.currentTab.toLowerCase()[0];
    setHash(this.props.history, `${tabKey}:${this.selectedTerm}`);
  }

  renderTitle() {
    return (
      <div>
        <Helmet title={`${capitalize(this.currentTab)} : ${this.selectedTerm}`} />
        <Toolbar>
          <ToolbarGroup>
            <ToolbarTitle text={this.selectedTerm} />
          </ToolbarGroup>
        </Toolbar>
      </div>
    );
  }

  renderTabs() {
    const tabColor = 'rgb(0, 188, 212)';
    const tabStyle = {backgroundColor: tabColor};

    return (
      <div style={{display: 'flex', backgroundColor: tabColor}}>
        <Tabs
          value={this.state.tabIdx}
          onChange={(tabIdx) => { this.setState({ tabIdx }, this.updateHash); }}
          style={{width: '80%'}}
          inkBarStyle={{backgroundColor: '#eee', height: 4, marginTop: -4, zIndex: 10}}
        >
          <Tab value={0} label={`Dictionary (${this.dictionaryTerms.length})`} style={tabStyle} />
          <Tab value={1} label={`Thesaurus (${this.thesaurusTerms.length})`} style={tabStyle}/>
          <Tab value={2} label={`Keywords (${this.keywordsTerms.length})`} style={tabStyle} />
        </Tabs>

        <DictionarySearchBar
          onChange={(searchText) => this.setState({ searchText })} />
      </div>
    );
  }

  renderPage() {
    return [
      [this.renderDictionaryDefinitions(), this.renderExamples(this.dictionaryExamples, this.selectedTerm)],
      this.renderExamples(this.thesaurusExamples, this.selectedTerm),
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
    const definitions = this.dictionaryDefinitions[this.selectedTerm] || [];
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
    const term = this.selectedTerm ? this.selectedTerm.toLowerCase() : null;
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

  renderDictionary() {
    return (
      <div>
        <div>
          <div style={{marginBottom: 15}}>
            This dictionary is automatically generated based on cards that players create.
            As more cards are created, it will become more and more comprehensive!
          </div>

          {this.renderTabs()}

          <div style={{display: 'flex', justifyContent: 'stretch', marginTop: 8}}>
            <DictionarySidebar
              terms={this.currentTabTerms}
              selectedTerm={this.selectedTerm}
              onClick={(term) => { this.selectTerm(term, this.updateHash); }} />

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

  render() {
    return (
      <RouterDialog
        path="dictionary"
        history={this.props.history}
        style={{width: '90%', maxWidth: 'none'}}
        actions={[
          <RaisedButton
            primary
            label="Close"
            onTouchTap={() => { RouterDialog.closeDialog(this.props.history); }} />
      ]}>
        {this.renderDictionary()}
      </RouterDialog>
    );
  }
}
