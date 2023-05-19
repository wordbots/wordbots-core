import { Button, Toolbar } from '@material-ui/core';
import { uniqBy } from 'lodash';
import * as React from 'react';

import * as w from '../../types';
import { checkValidityOfIntegrityHashes, getCardAbilities, validateIntegrityHashesAreComplete } from '../../util/cards';
import * as firebase from '../../util/firebase';
import { collection as coreSet } from '../../store/cards';

interface MiscUtilitiesPanelProps {
  cards: w.CardInStore[]
  sets: w.Set[]
  games: Record<string, w.SavedGame>
  reloadData: () => void
}

interface MiscUtilitiesPanelState {
  log: string[]
}

// TODO some of this functionality should probably move into util methods ...
class MiscUtilitiesPanel extends React.Component<MiscUtilitiesPanelProps, MiscUtilitiesPanelState> {
  state = {
    log: []
  }

  public render(): JSX.Element {
    const { reloadData } = this.props;
    const { log } = this.state;

    return (
      <div>
        <Toolbar
          disableGutters
          style={{ padding: 0, gap: 20 }}
        >
          <Button variant="contained" onClick={this.clearLog}>Clear Log</Button>
          <Button variant="contained" onClick={reloadData}>Reload Data</Button>
        </Toolbar >
        <Toolbar
          disableGutters
          style={{ padding: 0, gap: 20 }}
        >
          <Button variant="contained" onClick={this.cleanupGames}>Deduplicate Games</Button>
          <Button variant="contained" onClick={this.detectAllCardIntegrityProblems}>Detect Card Integrity Problems</Button>
        </Toolbar >
        <pre>
          {log.map((line, i) => <div key={i}>{line}</div>)}
        </pre>
      </div>
    );
  }

  private log = (line: string): void => {
    this.setState(({ log }) => ({
      log: [...log, line]
    }));
  }

  private clearLog = (): void => {
    this.setState({
      log: []
    });
  }

  private cleanupGames = async (): Promise<void> => {
    const { games } = this.props;
    this.log(`Games found: ${Object.keys(games).length}`);
    this.log(`Unique games found: ${uniqBy(Object.values(games), 'id').length}`);

    const gameIdsSeen: string[] = [];
    const duplicateGameFbIds: string[] = [];
    Object.entries(games).forEach(([fbId, game]) => {
      if (gameIdsSeen.includes(game.id)) {
        duplicateGameFbIds.push(fbId);
      } else {
        gameIdsSeen.push(game.id);
      }
    });
    this.log(`Will delete ${duplicateGameFbIds.length} entries from Firebase, with the following IDs:`);
    this.log(duplicateGameFbIds.join(', '));

    firebase.removeGames(duplicateGameFbIds);
  }

  private detectAllCardIntegrityProblems = async (): Promise<void> => {
    const { cards, sets } = this.props;
    this.log('ALL CARDS');
    await this.detectIntegrityProblemsForCards(cards);

    this.log('~~~');
    this.log('BUILT-IN CARDS');
    await this.detectIntegrityProblemsForCards(coreSet);

    for (const set of sets) {
      this.log('~~~');
      this.log(`SET: ${set.name} (${set.id}) by ${set.metadata.authorName} (excluding ${set.cards.filter((c) => c.id.startsWith('builtin/')).length} builtins)`);
      await this.detectIntegrityProblemsForCards(set.cards.filter((c) => !c.id.startsWith('builtin/')));
    }
  }

  private detectIntegrityProblemsForCards = async (cards: w.CardInStore[]): Promise<void> => {
    this.log(`Total # cards: ${cards.length}`);
    const numCardsWithNoIntegrity = cards.filter((c) => !c.integrity?.length).length;
    const numCardsWithNoAbilities = cards.filter((c) => !c.integrity?.length && getCardAbilities(c).length === 0).length;
    this.log(`Cards without integrity hashes at all: ${numCardsWithNoIntegrity} (of which ${numCardsWithNoAbilities} have no abilities)`);

    const cardsWithIncompleteIntegrityHashes: w.CardInStore[] = cards.filter((c) => !validateIntegrityHashesAreComplete(c, this.log));
    this.log(`Cards with missing/incomplete integrity hashes: ${cardsWithIncompleteIntegrityHashes.length}: ${cardsWithIncompleteIntegrityHashes.map((c) => c.id).join(', ')}`);

    const cardsWithHashesToVerify: w.CardInStore[] = cards.filter((card) => !cardsWithIncompleteIntegrityHashes.map((c) => c.id).includes(card.id));
    const { validCards, invalidCards, statistics: { numValidHashes, numInvalidHashes } } = await checkValidityOfIntegrityHashes(cardsWithHashesToVerify);
    this.log(`${numValidHashes}/${numValidHashes + numInvalidHashes} hashes are valid`);
    this.log(`Cards with invalid hashes: ${invalidCards.length}`);
    this.log(`${validCards.length !== cards.length ? '* ' : ''}Valid cards: ${validCards.length}`);
  }
}

export default MiscUtilitiesPanel;
