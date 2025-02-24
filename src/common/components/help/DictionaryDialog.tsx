/* eslint-disable react/no-unused-state */
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Toolbar from '@material-ui/core/Toolbar';
import { TabIndicatorProps } from '@material-ui/core/Tabs/TabIndicator';
import { History } from 'history';
import { capitalize, isEqual, mapKeys, noop, uniq } from 'lodash';
import * as React from 'react';
import Helmet from 'react-helmet';

import * as w from '../../types';
import { getHash, setHash } from '../../util/browser';
import { allKeywords, contractKeywords } from '../../util/cards';
import { getDictionaryData, markAchievement } from '../../util/firebase';
import StatusIcon from '../card/StatusIcon';
import RouterDialog from '../RouterDialog';

import DictionarySearchBar from './DictionarySearchBar';
import DictionarySidebar from './DictionarySidebar';

type DictionaryTab = 'dictionary' | 'thesaurus' | 'keywords';
type TabTerm = 'dictionaryTerm' | 'thesaurusTerm' | 'keywordsTerm';
const DICTIONARY_TABS: DictionaryTab[] = ['dictionary', 'thesaurus', 'keywords'];

interface DictionaryState {
  currentPath: string
  dictionary: w.Dictionary
  tabIdx: number
  dictionaryTerm: string | null
  thesaurusTerm: string | null
  keywordsTerm: string | null
  searchText: string
  showDefinitions: boolean
}

export default class DictionaryDialog extends React.Component<{ history: History }, DictionaryState> {
  public state: DictionaryState = {
    currentPath: '',
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

  public UNSAFE_componentWillMount(): void {
    this.checkHash();
  }

  public async componentDidMount(): Promise<void> {
    const dictionary: w.Dictionary = await getDictionaryData();
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState((state) => ({
      dictionary: { ...state.dictionary, ...dictionary }
    }));
  }

  public shouldComponentUpdate(nextProps: { history: History }, nextState: DictionaryState): boolean {
    return (
      !isEqual(nextState, this.state) ||
      // can't do `!== this.props.history.location.pathname` because History gets mutated by react-router -AN
      (nextProps.history.location.pathname !== this.state.currentPath)
    );
  }

  public componentDidUpdate(): void {
    const { tabIdx } = this.state;

    this.setState({ currentPath: this.props.history.location.pathname });

    if (tabIdx === 0) {
      markAchievement('openedDictionary');
    } else if (tabIdx === 1) {
      markAchievement('openedThesaurus');
    }
  }

  public UNSAFE_componentWillReceiveProps(): void {
    this.checkHash();
  }

  get currentTab(): DictionaryTab {
    return DICTIONARY_TABS[this.state.tabIdx];
  }
  get currentTabTerms(): string[] {
    return this[`${this.currentTab}Terms` as keyof DictionaryDialog];
  }
  get selectedTerm(): string {
    return this.state[`${this.currentTab}Term` as TabTerm] || this.currentTabTerms[0];
  }

  get hash(): string {
    const tabKey = this.currentTab.toLowerCase()[0];
    return `${tabKey}:${this.selectedTerm || ''}`;
  }

  get dictionaryTerms(): string[] {
    return Object.keys(this.dictionaryDefinitions)
      .filter((t) => t.includes(this.state.searchText) && t !== '"' && t !== '\'')
      .sort();
  }
  get dictionaryDefinitions(): Record<string, Array<{ syntax: string, semantics: string }>> {
    const { dictionary } = this.state;
    return this.cleanupTerms(dictionary.definitions || {});
  }
  get dictionaryExamples(): Record<string, string[]> {
    const { dictionary } = this.state;
    return this.cleanupTerms<string[]>(dictionary.examplesByToken || {});
  }

  get thesaurusTerms(): string[] {
    return Object.keys(this.thesaurusExamples)
      .filter((t) => t.includes(this.state.searchText))
      .sort();
  }
  get thesaurusExamples(): Record<string, string[]> {
    return this.state.dictionary.examplesByNode || {};
  }

  get keywordsTerms(): string[] {
    return Object.keys(allKeywords())
      .filter((t) => t.includes(this.state.searchText))
      .sort()
      .map(capitalize);
  }

  public render(): JSX.Element {
    const history = this.props.history;
    return (
      <RouterDialog
        path="dictionary"
        history={history}
        style={{ width: '80%' }}
        contentStyle={{ padding: 0 }}
      >
        {this.renderDictionary()}
      </RouterDialog>
    );
  }

  private cleanupTerms<T>(obj: Record<string, T>): Record<string, T> {
    return mapKeys(obj, (_value, term) => term.replace(' \'', '\''));
  }
  private cleanupExample = (example: string) => (
    capitalize(contractKeywords(example).trim())
      .replace(/,$/, '')
      .replace('activate:', 'Activate:')
  )
  private cleanupSemantics = (semantics: string) => (
    semantics.replace(/=>/g, '→').replace(/scala\./g, '').replace(/,(\w)/g, ', $1')
  )

  private selectTerm = (term: string, callback: () => void = noop) => {
    this.setState(
      { [`${this.currentTab}Term`]: term } as Pick<DictionaryState, TabTerm>,
      callback
    );
  }

  private checkHash = () => {
    const hash = getHash(this.props.history);
    if (hash && hash !== this.hash) {
      const [type, term] = hash.split(/:(.+)/); // https://stackoverflow.com/a/4607799
      const tabIdx = 'dtk'.indexOf(type);

      this.setState({ tabIdx }, () => {
        this.selectTerm(term.replace(/%20/g, ' '));
      });
    }
  }

  private updateHash = () => {
    setHash(this.props.history, this.hash);
  }

  private handleChangeTab = (_evt: React.ChangeEvent<unknown>, tabIdx: 0 | 1 | 2) => {
    this.setState({ tabIdx }, this.updateHash);
  };
  private handleCloseDialog = () => { RouterDialog.closeDialog(this.props.history); };
  private handleSelectTerm = (term: string) => { this.selectTerm(term, this.updateHash); };
  private handleSetSearchTerm = (searchText: string) => this.setState({ searchText });
  private handleShowDefinitions = () => { this.setState({ showDefinitions: true }); };
  private handleToggleDefinitions = () => this.setState((state) => ({ showDefinitions: !state.showDefinitions }));

  private renderTitle(): JSX.Element {
    return (
      <div>
        <Helmet title={`${capitalize(this.currentTab)} : ${this.selectedTerm}`} />
        <Toolbar
          disableGutters
          style={{
            backgroundColor: '#e4e4e4',
            minHeight: 56,
            paddingLeft: 10,
            paddingRight: 20,
            justifyContent: 'space-between'
          }}
        >
          <div style={{ marginLeft: '0.75em', fontSize: '1.25em', color: '#888' }}>
            {this.selectedTerm}
          </div>
          <FormControlLabel
            control={
              <Switch onChange={this.handleToggleDefinitions} checked={this.state.showDefinitions} />
            }
            label="Advanced"
            labelPlacement="start"
          />
        </Toolbar>
      </div>
    );
  }

  private renderTabs(): JSX.Element {
    const tabColor = 'rgb(0, 188, 212)';
    const tabStyle = { color: 'white', fontSize: '0.85em' };

    return (
      <div style={{ display: 'flex', backgroundColor: tabColor }}>
        <Tabs
          variant="fullWidth"
          value={this.state.tabIdx}
          onChange={this.handleChangeTab}
          style={{ width: '100%' }}
          TabIndicatorProps={{
            color: 'primary',
            style: { height: 5 } as unknown as TabIndicatorProps['style']
          }}
        >
          <Tab value={0} label={`Dictionary (${this.dictionaryTerms.length})`} style={tabStyle} />
          <Tab value={1} label={`Thesaurus (${this.thesaurusTerms.length})`} style={tabStyle} />
          <Tab value={2} label={`Keywords (${this.keywordsTerms.length})`} style={tabStyle} />
        </Tabs>

        <IconButton
          onClick={this.handleCloseDialog}
          style={{ color: 'white' }}
        >
          <Icon className="material-icons">close</Icon>
        </IconButton>
      </div>
    );
  }

  private renderPage(): React.ReactNode {
    return [
      [this.renderDictionaryDefinitions(), this.renderExamples(this.dictionaryExamples, this.selectedTerm)],
      this.renderExamples(this.thesaurusExamples, this.selectedTerm),
      this.renderKeywordsDefinition()
    ][this.state.tabIdx];
  }

  private renderExamples(examplesByTerm: Record<string, string[]>, term: string): React.ReactNode {
    if (examplesByTerm[term]) {
      const examples = uniq(examplesByTerm[term].map(this.cleanupExample));
      return (
        <div key="examples">
          <span style={{ fontSize: 24, fontWeight: 100 }}>Examples</span>
          <ul>
            {examples.map((example) =>
              <li key={example}>
                {example}.&nbsp;<StatusIcon text={example} result={{ parsed: true }} />
              </li>
            )}
          </ul>
        </div>
      );
    }
  }

  private renderDictionaryDefinitions(): React.ReactNode {
    const definitions = this.dictionaryDefinitions[this.selectedTerm] || [];
    if (this.state.showDefinitions) {
      return (
        <div key="definitions">
          <span style={{ fontSize: 24, fontWeight: 100 }}>Definitions</span>
          <ol>
            {definitions.map((d) =>
              <li key={`${d.syntax}${d.semantics}`}>
                <strong>{d.syntax}. </strong>{this.cleanupSemantics(d.semantics)}
              </li>
            )}
          </ol>
        </div>
      );
    } else if (definitions) {
      return (
        <div key="definitions" style={{ marginBottom: 20, textDecoration: 'underline', cursor: 'pointer' }}>
          <a onClick={this.handleShowDefinitions}>
            [Show {definitions.length} definition(s) <i>(Advanced feature)</i>]
          </a>
        </div>
      );
    }
  }

  private renderKeywordsDefinition(): React.ReactNode {
    const term = this.selectedTerm ? this.selectedTerm.toLowerCase() : null;
    if (term && allKeywords()[term]) {
      const definition = allKeywords()[term];
      return (
        <div key="definition">
          <span style={{ fontSize: 24, fontWeight: 100 }}>Definition</span>
          <p>
            {definition.endsWith(',') ? `${definition} [...] .` : definition}
          </p>
        </div>
      );
    }
  }

  private renderDictionary(): React.ReactNode {
    return (
      <div>
        {this.renderTabs()}

        <div style={{ display: 'flex', justifyContent: 'stretch' }}>
          <div style={{ width: '20%' }}>
            <DictionarySearchBar onChange={this.handleSetSearchTerm} text={this.state.searchText} />
            <DictionarySidebar
              terms={this.currentTabTerms}
              selectedTerm={this.selectedTerm}
              onClick={this.handleSelectTerm}
            />
          </div>

          <div style={{ width: '80%' }}>
            <Paper style={{ height: '100%' }}>
              {this.renderTitle()}

              <div style={{ padding: 20, height: '65vh', overflowY: 'auto', boxSizing: 'border-box' }}>
                {this.renderPage()}
              </div>
            </Paper>
          </div>
        </div>
      </div>
    );
  }
}
