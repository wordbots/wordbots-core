import React, { Component } from 'react';
import { object } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Paper from 'material-ui/Paper';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';
import { capitalize } from 'lodash';

import { KEYWORDS, HINTS, contractKeywords } from '../util/cards';
import StatusIcon from '../components/card/StatusIcon';
import DictionarySidebar from '../components/cards/DictionarySidebar';

export function mapStateToProps(state) {
  return {
    definitionsByToken: state.global.dictionary.definitions,
    examplesByToken: state.global.dictionary.examplesByToken,
    examplesByNode: state.global.dictionary.examplesByNode
  };
}

class Dictionary extends Component {
  static propTypes = {
    definitionsByToken: object,
    examplesByToken: object,
    examplesByNode: object,

    history: object
  }

  constructor(props) {
    super(props);

    this.state = {
      tabIdx: 0,
      selectedDictionaryIdx: 0,
      selectedThesaurusIdx: 0,
      selectedKeywordsIdx: 0
    };
  }

  componentWillReceiveProps() {
    if (this.hash) {
      const [ type, term ] = this.hash.split(':');
      if (type === 'd' && this.dictionaryTerms.indexOf(term) > -1) {
        this.setState({
          tabIdx: 0,
          selectedDictionaryIdx: this.state.selectedDictionaryIdx || this.dictionaryTerms.indexOf(term)
        });
      } else if (type === 't' && this.thesaurusTerms.indexOf(term) > -1) {
        this.setState({
          tabIdx: 1,
          selectedThesaurusIdx: this.state.selectedThesaurusIdx || this.thesaurusTerms.indexOf(term)
        });
      } else if (type === 'k' && this.keywordsTerms.indexOf(term) > -1) {
        this.setState({
          tabIdx: 2,
          selectedKeywordsIdx: this.state.selectedKeywordsIdx || this.keywordsTerms.indexOf(term)
        });
      }
    }
  }

  get hash() {
    return this.props.history.location.hash.split('#')[1] || '';
  }

  get currentTab() {
    return ['Dictionary', 'Thesaurus', 'Keywords'][this.state.tabIdx];
  }
  get currentTerm() {
    return [this.dictionaryTerm, this.thesaurusTerm, this.keywordsTerm][this.state.tabIdx];
  }

  get dictionaryTerms() {
    return Object.keys(this.props.definitionsByToken).filter(t => t !== '"' && t !== '\'').sort();
  }
  get dictionaryTerm() {
    return this.dictionaryTerms[this.state.selectedDictionaryIdx] || '';
  }

  get thesaurusTerms() {
    return Object.keys(this.props.examplesByNode).sort();
  }
  get thesaurusTerm() {
    return this.thesaurusTerms[this.state.selectedThesaurusIdx] || '';
  }

  get keywords() {
    return Object.assign({}, KEYWORDS, HINTS);
  }
  get keywordsTerms() {
    return Object.keys(this.keywords).sort().map(k => capitalize(k));
  }
  get keywordsTerm() {
    return this.keywordsTerms[this.state.selectedKeywordsIdx] || '';
  }

  setHash() {
    const newHash = `#${this.currentTab.toLowerCase()[0]}:${this.currentTerm}`;
    this.props.history.push(`${this.props.history.location.pathname}${newHash}`);
  }

  renderTerm() {
    const term = this.currentTerm.replace(' \'', '\'');  // e.g. "robot 's" => "robot's"
    return (
      <div>
        <Helmet title={`${this.currentTab} : ${term}`} />
        <Toolbar>
          <ToolbarGroup>
            <ToolbarTitle text={term} />
          </ToolbarGroup>
        </Toolbar>
      </div>
    );
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
    const definitions = this.props.definitionsByToken[this.dictionaryTerm] || [];
    return (
      <div key="definitions">
        <span style={{fontSize: 24, fontWeight: 100}}>Definitions</span>
        <ol>
          {definitions.map(d =>
            <li key={`${d.syntax}${d.semantics}`}>
              <strong>{d.syntax}. </strong>
              {d.semantics.replace(/=>/g, '→').replace(/\,(\w)/g, '\, $1')}
            </li>
          )}
        </ol>
      </div>
    );
  }

  renderKeywordsDefinition() {
    const definition = this.keywords[this.keywordsTerm.toLowerCase()];
    return (
      <div key="definition">
        <span style={{fontSize: 24, fontWeight: 100}}>Definition</span>
        <p>
          {definition.endsWith(',') ? `${definition} [...] .` : definition}
        </p>
      </div>
    );
  }

  renderBook(terms, selectedIdx, content) {
    return (
      <div style={{display: 'flex', justifyContent: 'stretch'}}>
        <DictionarySidebar
          terms={terms}
          selectedIdx={selectedIdx}
          onClick={(idx) => {
            this.setState({
              [`selected${this.currentTab}Idx`]: idx
            }, this.setHash.bind(this));
          }} />

        <div style={{width: '80%'}}>
          <Paper style={{height: '65vh'}}>
            {this.renderTerm()}

            <div style={{padding: 20, height: 'calc(100% - 56px)', overflowY: 'auto', boxSizing: 'border-box'}}>
              {content}
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
              {
                this.renderBook(this.dictionaryTerms, this.state.selectedDictionaryIdx, [
                  this.renderDictionaryDefinitions(),
                  this.renderExamples(this.props.examplesByToken, this.dictionaryTerm)
                ])
              }
            </Tab>
            <Tab label="Thesaurus" value={1}>
              {
                this.renderBook(this.thesaurusTerms, this.state.selectedThesaurusIdx, [
                  this.renderExamples(this.props.examplesByNode, this.thesaurusTerm)
                ])
              }
            </Tab>
            <Tab label="Keywords" value={2}>
              {
                this.renderBook(this.keywordsTerms, this.state.selectedKeywordsIdx, [
                  this.renderKeywordsDefinition()
                ])
              }
            </Tab>
          </Tabs>
        </div>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps)(Dictionary));
