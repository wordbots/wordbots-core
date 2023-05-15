import { Button, Toolbar } from '@material-ui/core';
import { uniqBy } from 'lodash';
import * as React from 'react';

import * as w from '../../types';
import * as firebase from '../../util/firebase';

interface MiscUtilitiesPanelProps {
  games: Record<string, w.SavedGame>
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
    const { log } = this.state;
    return (
      <div>
        <Toolbar
          disableGutters
          style={{
            padding: 0,
            gap: 20
          }}
        >
          <Button variant="contained" onClick={this.clearLog}>Clear Log</Button>
          <Button variant="contained" onClick={this.cleanupGames}>Deduplicate Games</Button>
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
}

export default MiscUtilitiesPanel;
