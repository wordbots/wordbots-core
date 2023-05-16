import { compact, countBy, noop, omit } from 'lodash';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper } from '@material-ui/core';
import * as React from 'react';

import * as w from '../../types';
import { TYPE_EVENT } from '../../constants';
import { md5 } from '../../util/common';
import { expandKeywords, getCardAbilities, getSentencesFromInput, parseBatch } from '../../util/cards';
import * as firebase from '../../util/firebase';
import { collection as coreSet } from '../../store/cards';
import { Card } from '../card/Card';
import { DIALOG_PAPER_BASE_STYLE } from '../RouterDialog';
import CardGrid from '../cards/CardGrid';

interface PreviewReport {
  statistics: {
    numErrors: number
    numChanged: number
    numUnchanged: number
  }
  changedCards: Array<w.CardInStore & { parseErrors: string[], oldAbilities: string[], newAbilities: string[] }>
}

interface CardMigrationPanelProps {
  cards: w.CardInStore[]
  sets: w.Set[]
  parserVersion: { version: string, sha: string } | undefined
  reloadData: () => void
}

interface CardMigrationPanelState {
  migrationPreviewReport: PreviewReport | null
  cardsBeingMigrated: w.CardInStore[]
  setBeingMigrated: w.SetId | null
  isPreviewingMigration?: boolean
}

// TODO some of this functionality should probably move into util methods ...
class CardMigrationPanel extends React.PureComponent<CardMigrationPanelProps> {
  state: CardMigrationPanelState = {
    cardsBeingMigrated: [],
    setBeingMigrated: null,
    migrationPreviewReport: null
  };

  private renderPanelForCards(cards: w.CardInStore[], setId: w.SetId | null, builtIn?: boolean) {
    const { parserVersion } = this.props;
    const { isPreviewingMigration } = this.state;
    const outOfDateCards = parserVersion ? cards.filter(c => c.metadata.source.type !== 'builtin' && c.parserV !== parserVersion!.version) : undefined;
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
              Out-of-date Cards ({builtIn ? '??' : outOfDateCards!.length}){' '}
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
    const { cards, sets, parserVersion } = this.props;
    const { cardsBeingMigrated, migrationPreviewReport, setBeingMigrated } = this.state;

    return (
      <div>
        <Paper style={{ margin: 20, padding: 10 }}>
          <h2>All player-made cards</h2>
          {this.renderPanelForCards(cards, null)}
        </Paper>
        <Paper style={{ margin: 20, padding: 10 }}>
          <h2>Built-in cards</h2>
          {this.renderPanelForCards(coreSet, null, true)}
        </Paper>
        {sets.map((set) => (
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
                    <div>New JS ({parserVersion?.version}):{' '}
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
                disabled={migrationPreviewReport.statistics.numErrors > 0 || (cardsBeingMigrated.every((c) => c.id.startsWith('builtin') && !setBeingMigrated))}
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

  private async previewMigration(cards: w.CardInStore[], setId: w.SetId | null): Promise<void> {
    function sentencesForCard(c: w.CardInStore): string[] {
      return (c.text ? getSentencesFromInput(c.text) : []).map((s) => expandKeywords(s));
    }

    this.setState({
      cardsBeingMigrated: cards,
      setBeingMigrated: setId,
      isPreviewingMigration: true
    });

    const objectCards = cards.filter((c) => c.type !== TYPE_EVENT);
    const eventCards = cards.filter((c) => c.type === TYPE_EVENT);

    const objectCardSentences = compact(objectCards.flatMap(sentencesForCard));
    const eventCardSentences = compact(eventCards.flatMap(sentencesForCard));

    const objectCardParseResults = await parseBatch(objectCardSentences, 'object');
    const eventCardParseResults = await parseBatch(eventCardSentences, 'event');
    const parseResults = [...objectCardParseResults, ...eventCardParseResults];

    const errors = compact(parseResults.map((r) => (r.result as w.FailedParseResult).error));
    const integrityHashes: w.Hashes[] = compact(parseResults.flatMap((r) => (r.result as w.SuccessfulParseResult).hashes));
    const parseResultForSentence = Object.fromEntries(parseResults.map((({ sentence, result }) => [sentence, result])));

    const changedCards = (
      cards
        .map((c) => ({
          ...c,
          parseErrors: compact(sentencesForCard(c).map((s) => (parseResultForSentence[s] as w.FailedParseResult | undefined)?.error)),
          oldAbilities: getCardAbilities(c),
          newAbilities: compact(sentencesForCard(c).map((s) => (parseResultForSentence[s] as w.SuccessfulParseResult | undefined)?.js)),
          integrity: integrityHashes.filter((hash) => sentencesForCard(c).map(md5).includes(hash.input)),
          oldIntegrity: c.integrity
        }))
        .filter((c) => c.oldAbilities.join('\n') !== c.newAbilities.join('\n') || (c.integrity.length > 0 && !c.oldIntegrity?.length) || c.parseErrors.length > 0)
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
    this.props.reloadData();
  }

  // TODO move to util/cards ?
  private migrateCard(card: w.CardInStore & { parseErrors: string[], oldAbilities: string[], newAbilities: string[] }, setId: w.SetId | null) {
    const { sets, parserVersion } = this.props;

    if (card.parseErrors.length === 0) {
      const originalParserV = card.parserV || 'unknown';
      const migratedCard: w.CardInStore = {
        ...omit(card, ['parseErrors', 'oldAbilities', 'newAbilities', 'oldIntegrity']) as w.CardInStore,
        ...(card.type === TYPE_EVENT ? { command: card.newAbilities } : { abilities: card.newAbilities }),
        parserV: parserVersion!.version,
        originalParserV,
        migrationBackup: [
          ...(card.migrationBackup || []),
          { parserV: originalParserV, abilities: card.oldAbilities }  // TODO record migration time?
        ]
      };

      if (setId) {
        const cardIdx = sets.find((s) => s.id === setId)?.cards.findIndex((c) => c.id === card.id);
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
    const { sets, parserVersion } = this.props;

    const migratedCard: w.CardInStore = {
      ...card,
      parserV: parserVersion!.version,
      originalParserV: card.parserV || 'unknown'
    };

    if (setId) {
      const cardIdx = sets.find((s) => s.id === setId)?.cards.findIndex((c) => c.id === card.id);
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

export default CardMigrationPanel;
