import * as React from 'react';
import { object } from 'prop-types';
import Helmet from 'react-helmet';
import Paper from '@material-ui/core/Paper';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import Toggle from 'material-ui/Toggle';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';
import { capitalize, mapKeys, noop, uniq } from 'lodash';

import { getHash, setHash } from '../../util/browser.tsx';
import { allKeywords, contractKeywords } from '../../util/cards.ts';
import { listenToDictionaryData } from '../../util/firebase.ts';
import RouterDialog from '../RouterDialog';
import StatusIcon from '../card/StatusIcon';

import DictionarySearchBar from './DictionarySearchBar';
import DictionarySidebar from './DictionarySidebar';

export default class DictionaryDialog extends React.Component {
  static propTypes = {
    history: object
  }

  state = {
    dictionary: {
      definitions: {},
      examplesByToken: {},
      examplesByNode: {}
    },
    tabIdx: 0,
    dictionaryTerm: null,
    thesaurusTerm: null,
    keywordsTerm: null,
    searchText: '',
    showDefinitions: false
  };

  componentWillMount() {
    this.checkHash();
  }

  componentDidMount() {
    listenToDictionaryData(data => {
      this.setState(state => ({
        dictionary: Object.assign({}, state.dictionary, data.dictionary)
      }));
    });
  }

  componentWillReceiveProps() {
    this.checkHash();
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

  get hash() {
    const tabKey = this.currentTab.toLowerCase()[0];
    return `${tabKey}:${this.selectedTerm || ''}`;
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
  );
  cleanupExample = (example) => (
    capitalize(contractKeywords(example).trim())
      .replace(/,$/, '')
      .replace('activate:', 'Activate:')
  );
  cleanupSemantics = (semantics) => (
    semantics.replace(/=>/g, '→').replace(/scala\./g, '').replace(/,(\w)/g, ', $1')
  );

  selectTerm = (term, callback = noop) => {
    this.setState({
      [`${this.currentTab}Term`]: term
    }, callback);
  };

  checkHash = () => {
    const hash = getHash(this.props.history);
    if (hash && hash !== this.hash) {
      const [ type, term ] = hash.split(':');
      const tabIdx = 'dtk'.indexOf(type);

      this.setState({ tabIdx }, () => {
        this.selectTerm(term);
      });
    }
  };

  updateHash = () => {
    setHash(this.props.history, this.hash);
  };

  handleChangeTab = (tabIdx) => { this.setState({ tabIdx }, this.updateHash); };
  handleCloseDialog = () => { RouterDialog.closeDialog(this.props.history); };
  handleSelectTerm = (term) => { this.selectTerm(term, this.updateHash); };
  handleSetSearchTerm = (searchText) => this.setState({ searchText });
  handleShowDefinitions = () => { this.setState({ showDefinitions: true }); };
  handleToggleDefinitions = () => this.setState(state => ({ showDefinitions: !state.showDefinitions }));

  renderTitle() {
    return (
      <div>
        <Helmet title={`${capitalize(this.currentTab)} : ${this.selectedTerm}`} />
        <Toolbar>
          <ToolbarGroup>
            <ToolbarTitle text={this.selectedTerm} />
          </ToolbarGroup>
          <ToolbarGroup>
            <Toggle label="Advanced" onToggle={this.handleToggleDefinitions} toggled={this.state.showDefinitions}/>
          </ToolbarGroup>
        </Toolbar>
      </div>
    );
  }

  renderTabs() {
    const tabColor = 'rgb(0, 188, 212)';
    const tabStyle = {backgroundColor: tabColor, borderRadius: 0};

    return (
      <div style={{display: 'flex', backgroundColor: tabColor}}>
        <Tabs
          value={this.state.tabIdx}
          onChange={this.handleChangeTab}
          style={{width: '100%'}}
          inkBarStyle={{height: 7, marginTop: -7, zIndex: 10}}
        >
          <Tab value={0} label={`Dictionary (${this.dictionaryTerms.length})`} style={tabStyle} />
          <Tab value={1} label={`Thesaurus (${this.thesaurusTerms.length})`} style={tabStyle}/>
          <Tab value={2} label={`Keywords (${this.keywordsTerms.length})`} style={tabStyle} />
        </Tabs>

        <IconButton
          onTouchTap={this.handleCloseDialog}>
          <FontIcon className="material-icons" color="white">close</FontIcon>
        </IconButton>
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
    if (this.state.showDefinitions) {
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
    } else if (definitions) {
      return (
        <div key="definitions" style={{marginBottom: 20, textDecoration: 'underline', cursor: 'pointer'}}>
          <a onClick={this.handleShowDefinitions}>
            [Show {definitions.length} definition(s) <i>(Advanced feature)</i>]
          </a>
        </div>
      );
    }
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
        {this.renderTabs()}

        <div style={{display: 'flex', justifyContent: 'stretch'}}>
          <div style={{width: '20%'}}>
            <DictionarySearchBar onChange={this.handleSetSearchTerm} />
            <DictionarySidebar
              terms={this.currentTabTerms}
              selectedTerm={this.selectedTerm}
              onClick={this.handleSelectTerm} />
          </div>

          <div style={{width: '80%'}}>
            <Paper style={{height: '100%'}}>
              {this.renderTitle()}

              <div style={{padding: 20, height: '65vh', overflowY: 'auto', boxSizing: 'border-box'}}>
                {this.renderPage()}
              </div>
            </Paper>
          </div>
          </div>
      </div>
    );
  }

  render() {
    const history = this.props.history;
    return (
      <RouterDialog
        path="dictionary"
        history={history}
        bodyStyle={{padding: 0}}
        style={{width: '80%', maxWidth: 'none'}}>
        {this.renderDictionary()}
      </RouterDialog>
    );
  }
}
