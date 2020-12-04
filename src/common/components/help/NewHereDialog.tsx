import { History } from 'history';
import RaisedButton from 'material-ui/RaisedButton';
import * as React from 'react';

import * as w from '../../types';
import { toggleFlag } from '../../util/browser';
import { getAchievements, getRecentGamesByUserId } from '../../util/firebase';
import RouterDialog from '../RouterDialog';

import NewHereLink from './NewHereLink';

interface NewHereDialogProps {
  collection: w.CollectionState
  history: History
  uid: w.UserId | null
}

interface NewHereDialogState {
  achievements: string[]
  games: w.SavedGame[]
}

export default class NewHereDialog extends React.Component<NewHereDialogProps, NewHereDialogState> {
  public state: NewHereDialogState = {
    achievements: [],
    games: []
  };

  get cards(): w.CardInStore[] {
    const { collection, uid } = this.props;
    return collection.cards.filter((c) => c.metadata.source.uid === uid);
  }

  get decks(): w.DeckInStore[] {
    const { collection, uid } = this.props;
    return collection.decks.filter((d) => d.authorId === uid);
  }

  public async componentDidMount(): Promise<void> {
    const { uid } = this.props;
    const achievements: string[] = await getAchievements();
    const games = uid ? await getRecentGamesByUserId(uid) : [];
    this.setState({ achievements, games });
  }

  public render(): JSX.Element {
    const { history, uid } = this.props;
    const { achievements, games } = this.state;

    return (
      <RouterDialog
        path="new-here"
        history={history}
        style={{width: 650}}
        actions={[
          <span
            key="don't-show-again"
            style={{ float: 'left', padding: 5, fontSize: '0.85em' }}
            onClick={this.dontShowAgain}
          >
            <a className="underline">Don&rsquo;t show this dialog again</a>
          </span>,
          <RaisedButton
            primary
            label="Close"
            key="Close"
            onClick={this.handleClose}
          />
        ]}
      >
        <div>
          <p>Welcome! <b>Wordbots</b> is a new kind of card game, where players <i>– like you –</i> get to write the cards.</p>
          <p>There&rsquo;s a lot to take in, so here&rsquo;s the order we&rsquo;d suggest checking things out to get a feel for how Wordbots works (or, ignore this and just go exploring!):</p>
          {!uid && <p><i>A <a onClick={this.handleClickLogin} className="underline">user account</a> is required to save cards or play against other players.</i></p>}
        </div>

        <table style={{ margin: '0 auto' }}>
          <tbody>
            <tr>
              <td>
                <NewHereLink idx={1} href="/play/tutorial" accomplished={achievements.includes('finishedTutorial')}>
                  Play through the interactive gameplay tutorial.
                </NewHereLink>
              </td>
              <td>
                <NewHereLink idx={2} href="/play//practice" accomplished={achievements.includes('playedPracticeGame')}>
                  Try an AI practice game using one of the built-in decks.
                </NewHereLink>
              </td>
              <td>
                <NewHereLink idx={3} href="/sets" accomplished={this.decks.filter((d) => d.setId).length > 0}>
                  Find a custom set that looks cool, build a deck, and challenge other players with it.
                </NewHereLink>
              </td>
            </tr>
            <tr>
              <td>
                <NewHereLink idx={4} href="/card/new//help" accomplished={achievements.includes('openedCardCreatorHelp')}>
                  Watch the tutorial on how to use the Card Creator.
                </NewHereLink>
              </td>
              <td>
                <NewHereLink idx={5} href="/card/new" accomplished={this.cards.length >= 2}>
                  <br />Make some cards!
                </NewHereLink>
              </td>
              <td>
                <NewHereLink idx={6} href="/card/new//dictionary" accomplished={achievements.includes('openedDictionary') && achievements.includes('openedThesaurus')}>
                  If you get stuck (or want some more ideas), explore the dictionary and thesaurus dialog.
                </NewHereLink>
              </td>
            </tr>
            <tr>
              <td>
                <NewHereLink idx={7} href="/decks" accomplished={this.decks.filter((d) => !d.setId).length > 0}>
                  Build a deck, using a combination of your own, built-in, and/or other players&rsquo; cards.
                </NewHereLink>
              </td>
              <td>
                <NewHereLink idx={8} href="/play//host" accomplished={games.length >= 2}>
                  Challenge other players with your deck, in either the &ldquo;Anything&nbsp;Goes&rdquo; or &ldquo;Shared&nbsp;Deck&rdquo; format.
                </NewHereLink>
              </td>
              <td>
                <NewHereLink idx={9}>
                  Now the world of Wordbots is your oyster!
                  <div style={{ marginTop: 5 }}><em>(Bonus points: make your own set!)</em></div>
                </NewHereLink>
              </td>
            </tr>
          </tbody>
        </table>
      </RouterDialog>
    );
  }

  private handleClose = () => { RouterDialog.closeDialog(this.props.history); };

  private handleClickLogin = () => {
    RouterDialog.openDialog(this.props.history, 'login');
  }

  private dontShowAgain = () => {
    toggleFlag('skipNewHere');
    this.handleClose();
  }
}
