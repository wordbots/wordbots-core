import * as fb from 'firebase';
import { compact, countBy, noop, omit } from 'lodash';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper } from '@material-ui/core';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router';

import * as w from '../types';
import { expandKeywords, getSentencesFromInput, normalizeCard, parseBatch } from '../util/cards';
import * as firebase from '../util/firebase';
import { FIREBASE_CONFIG, PARSER_URL, TYPE_EVENT } from '../constants';
import CardGrid from '../components/cards/CardGrid';
import { Card } from '../components/card/Card';
import { DIALOG_PAPER_BASE_STYLE } from '../components/RouterDialog';

interface PreviewReport {
  statistics: {
    numErrors: number
    numChanged: number
    numUnchanged: number
  }
  changedCards: Array<w.CardInStore & { parseErrors: string[], oldAbilities: string[], newAbilities: string[] }>
}

interface AdminProps {
  user: fb.User | null
  version: string
}

interface AdminState {
  allCards: w.CardInStore[]
  allSets: w.Set[]
  migrationPreviewReport: PreviewReport | null
  cardsBeingMigrated: w.CardInStore[]
  setBeingMigrated: w.SetId | null
  parserVersion?: string
  isPreviewingMigration?: boolean
}

export function mapStateToProps(state: w.State): AdminProps {
  return {
    user: state.global.user,
    version: state.version
  };
}

// TODO some of this functionality should probably move into util methods ...
class Admin extends React.PureComponent<AdminProps> {
  state: AdminState = {
    allCards: [],
    allSets: [],
    cardsBeingMigrated: [],
    setBeingMigrated: null,
    migrationPreviewReport: null
  };

  public componentWillMount() {
    this.loadData();
  }

  private loadData() {
    void this.fetchCards();
    void this.fetchSets();
    void this.lookupParserVersion();
  }

  private renderPanelForCards(cards: w.CardInStore[], setId: w.SetId | null) {
    const { parserVersion, isPreviewingMigration } = this.state;
    const outOfDateCards = parserVersion ? cards.filter(c => c.metadata.source.type !== 'builtin' && c.parserV !== parserVersion) : undefined;
    const onClickPreview = () => { this.previewMigration(cards, setId); };

    return (
      <div>
        <ul>
          {Object.entries(countBy(cards, (c) => c.metadata.source.type === 'builtin' ? 'builtin' : c.parserV)).map(([parserV, count]) =>
            <li key={parserV}>parser {parserV} – {count} cards</li>
          )}
        </ul>
        {parserVersion && (
          <div>
            <h3>
              Out-of-date Cards ({outOfDateCards!.length}){' '}
              <Button variant="outlined" onClick={onClickPreview} disabled={isPreviewingMigration}>
                Preview Migration
              </Button>
            </h3>
            <CardGrid
              cards={outOfDateCards!}
              selectedCardIds={[]}
              selectable={false}
              onCardClick={noop}
            />
          </div>
        )}
      </div>
    );
  }

  public render(): JSX.Element {
    const { user } = this.props;
    const { allCards, allSets, parserVersion, migrationPreviewReport } = this.state;
    const [version] = this.props.version.split('+');

    // Redirect away unless admin user and on localhost (only admin user has actual firebase privileges for migrations anyway!)
    if (window.location.hostname !== 'localhost' || user?.email !== 'alex.nisnevich@gmail.com') {
      return <Redirect to="/" />;
    }

    return (
      <div className="helpPage">
        <Helmet title="Admin" />
        <Paper style={{ margin: 20, padding: 10 }}>
          <div><b>Parser URL:</b> {PARSER_URL}</div>
          <div><b>Firebase URL:</b> {FIREBASE_CONFIG.databaseURL}</div>
          <div><b>Game Version:</b> {version}</div>
          <div><b>Parser Version:</b> {parserVersion}</div>
        </Paper>
        <Paper style={{ margin: 20, padding: 10 }}>
          <h2>All cards</h2>
          {this.renderPanelForCards(allCards, null)}
        </Paper>
        {allSets.map((set) => (
          <Paper key={set.id} style={{ margin: 20, padding: 10 }}>
            <h2>Cards in set <i>{set.name}</i> by {set.metadata.authorName}</h2>
            {this.renderPanelForCards(set.cards, set.id)}
          </Paper>
        ))}
        {migrationPreviewReport && (
          <Dialog
            open={!!migrationPreviewReport}
            PaperProps={{ style: { ...DIALOG_PAPER_BASE_STYLE, width: '80%' } }}
            onClose={this.handleDismissMigrationPreview}
          >
            <DialogTitle>Migration Preview</DialogTitle>
            <DialogContent>
              <pre>
                {JSON.stringify(migrationPreviewReport.statistics, null, 2)}
              </pre>
              {migrationPreviewReport.changedCards.map((card) => (
                <div key={card.id} style={{ display: 'flex' }}>
                  <div>
                    {Card.fromObj(card)}
                  </div>
                  <div style={{ padding: 15 }}>
                    <div>Old JS ({card.parserV}): <pre style={{ whiteSpace: 'pre-wrap', width: '100%' }}>{card.oldAbilities.join('\n')}</pre></div>
                    <div>New JS ({parserVersion}):{' '}
                      <pre style={{ whiteSpace: 'pre-wrap', width: '100%' }}>
                        {card.parseErrors.length > 0 ? <span style={{ fontWeight: 'bold', color: 'red' }}>{card.parseErrors.join('\n')}</span> : card.newAbilities.join('\n')}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </DialogContent>
            <DialogActions>
              <Button
                key="Migrate"
                color="secondary"
                variant="contained"
                disabled={migrationPreviewReport.statistics.numErrors > 0}
                onClick={this.migrateCardsFromPreview}
              >
                Migrate
              </Button>
              <Button
                key="Close"
                color="primary"
                variant="contained"
                onClick={this.handleDismissMigrationPreview}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </div>
    );
  }

  private async fetchCards(): Promise<void> {
    const allCards = await firebase.getCards(null);
    this.setState({ allCards });
  }

  private async fetchSets(): Promise<void> {
    const allSetsUnnormalized = await firebase.getSets();
    const allSets = allSetsUnnormalized.map((set) => ({ ...set, cards: set.cards.map((c) => normalizeCard(c)) }));
    this.setState({ allSets });
  }

  private async lookupParserVersion(): Promise<void> {
    const parserResponse = await fetch(`${PARSER_URL}/parse?format=js&input=Draw%20a%20card`);
    const parserResponseJson = await parserResponse.json();
    this.setState({ parserVersion: parserResponseJson.version });
  }

  private async previewMigration(cards: w.CardInStore[], setId: w.SetId | null): Promise<void> {
    this.setState({
      cardsBeingMigrated: cards,
      setBeingMigrated: setId,
      isPreviewingMigration: true
    });

    const objectCards = cards.filter((c) => c.type !== TYPE_EVENT);
    const eventCards = cards.filter((c) => c.type === TYPE_EVENT);

    const objectCardSentences = compact(objectCards.flatMap(c => c.text ? getSentencesFromInput(c.text) : []).map((s) => expandKeywords(s)));
    const eventCardSentences = compact(eventCards.flatMap(c => c.text ? getSentencesFromInput(c.text) : []).map((s) => expandKeywords(s)));

    const objectCardParseResults = await parseBatch(objectCardSentences, 'object');
    const eventCardParseResults = await parseBatch(eventCardSentences, 'event');
    const parseResults = [...objectCardParseResults, ...eventCardParseResults];

    const errors = compact(parseResults.map((r) => r.result.error));
    const parseResultForSentence = Object.fromEntries(parseResults.map((({ sentence, result }) => [sentence, result])));

    const changedCards = (
      cards
        .map((c) => ({
          ...c,
          parseErrors: compact(getSentencesFromInput(c.text || '').map((s) => expandKeywords(s)).map((s) => parseResultForSentence[s]?.error)),
          oldAbilities: (c.command ? [c.command].flat() : c.abilities || []),
          newAbilities: compact(getSentencesFromInput(c.text || '').map((s) => expandKeywords(s)).map((s) => parseResultForSentence[s]?.js))
        }))
        .filter((c) => c.oldAbilities.join('\n') !== c.newAbilities.join('\n') || c.parseErrors.length > 0)
    );

    this.setState({
      isPreviewingMigration: false,
      migrationPreviewReport: {
        statistics: {
          numErrors: errors.length,
          numChanged: changedCards.length,
          numUnchanged: cards.length - changedCards.length
        },
        changedCards
      }
    });
  }

  private migrateCardsFromPreview = () => {
    const { cardsBeingMigrated, setBeingMigrated, migrationPreviewReport } = this.state;
    if (migrationPreviewReport) {
      const { statistics: { numErrors }, changedCards } = migrationPreviewReport;
      if (numErrors === 0) {
        cardsBeingMigrated.forEach((card) => {
          const changedCard: (w.CardInStore & { parseErrors: string[], oldAbilities: string[], newAbilities: string[] }) | undefined = changedCards.find((c) => c.id === card.id);
          if (changedCard) {
            this.migrateCard(changedCard, setBeingMigrated);
          } else {
            this.fastForwardCard(card, setBeingMigrated);
          }
        });
      }
    }

    this.handleDismissMigrationPreview();
    this.loadData();
  }

  // TODO move to util/cards ?
  private migrateCard(card: w.CardInStore & { parseErrors: string[], oldAbilities: string[], newAbilities: string[] }, setId: w.SetId | null) {
    const { allSets, parserVersion } = this.state;

    if (card.parseErrors.length === 0) {
      const originalParserV = card.parserV || 'unknown';
      const migratedCard: w.CardInStore = {
        ...omit(card, ['parseErrors', 'oldAbilities', 'newAbilities']),
        ...(card.type === TYPE_EVENT ? { command: card.newAbilities } : { abilities: card.newAbilities }),
        parserV: parserVersion!,
        originalParserV,
        migrationBackup: [
          ...(card.migrationBackup || []),
          { parserV: originalParserV, abilities: card.oldAbilities }  // TODO record migration time?
        ]
      };

      if (setId) {
        const cardIdx = allSets.find((s) => s.id === setId)?.cards.findIndex((c) => c.id === card.id);
        console.log(`Migrated sets/${setId}/cards/${cardIdx}`);
        if (cardIdx !== undefined && cardIdx > -1) {
          firebase.saveCardInSet(migratedCard, setId, cardIdx);
        }
      } else {
        console.log(`Migrated cards/${migratedCard.id}`);
        firebase.saveCard(migratedCard);
      }
    }
  }

  // TODO move to util/cards ?
  private fastForwardCard(card: w.CardInStore, setId: w.SetId | null) {
    const { allSets, parserVersion } = this.state;

    const migratedCard: w.CardInStore = {
      ...card,
      parserV: parserVersion!,
      originalParserV: card.parserV || 'unknown'
    };

    if (setId) {
      const cardIdx = allSets.find((s) => s.id === setId)?.cards.findIndex((c) => c.id === card.id);
      if (cardIdx !== undefined && cardIdx > -1) {
        firebase.saveCardInSet(migratedCard, setId, cardIdx);
      }
    } else {
      firebase.saveCard(migratedCard);
    }
  }

  private handleDismissMigrationPreview = (): void => {
    this.setState({
      migrationPreviewReport: null
    });
  }
}

export default withRouter(connect(mapStateToProps)(Admin));
