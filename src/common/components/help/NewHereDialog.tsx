import { History } from 'history';
import RaisedButton from 'material-ui/RaisedButton';
import * as React from 'react';

import RouterDialog from '../RouterDialog';

import NewHereLink from './NewHereLink';

export default class NewHereDialog extends React.Component<{ history: History }> {
  public render(): JSX.Element {
    const { history } = this.props;
    return (
      <RouterDialog
        path="new-here"
        history={history}
        style={{width: 650}}
        actions={[
          <RaisedButton
            primary
            label="Close"
            key="Close"
            onClick={this.handleClose}
          />
        ]}
      >
        <p>Welcome! <b>Wordbots</b> is a new kind of card game, where players <i>– like you –</i> get to write the cards.</p>
        <p>There's a lot to take in, so here's the order we'd suggest checking things out to get a feel for how Wordbots works (or, ignore this and just go exploring!):</p>
        <table style={{ margin: '0 auto' }}>
          <tr>
            <td>
              <NewHereLink idx={1} href="/play/tutorial">Play through the interactive gameplay tutorial.</NewHereLink>
            </td>
            <td>
              <NewHereLink idx={2} href="/play//practice">Try an AI practice game using one of the built-in decks.</NewHereLink>
            </td>
            <td>
              <NewHereLink idx={3} href="/sets">Find a custom set that looks cool, build a deck, and challenge other players with it.</NewHereLink>
            </td>
          </tr>
          <tr>
            <td>
              <NewHereLink idx={4} href="/card/new//help">Watch the tutorial on how to use the Card Creator.</NewHereLink>
            </td>
            <td>
              <NewHereLink idx={5} href="/card/new"><br />Make some cards!</NewHereLink>
            </td>
            <td>
              <NewHereLink idx={6} href="/card/new//dictionary">If you get stuck (or want some more ideas), explore the dictionary and thesaurus dialog.</NewHereLink>
            </td>
          </tr>
          <tr>
            <td>
              <NewHereLink idx={7} href="/decks">Build a deck, using a combination of your own, built-in, and/or other players' cards.</NewHereLink>
            </td>
            <td>
              <NewHereLink idx={8} href="/play//host">Challenge other players with your deck, in either the "Anything&nbsp;Goes" or "Shared&nbsp;Deck" format.</NewHereLink>
            </td>
            <td>
              <NewHereLink idx={9}>Now the world of Wordbots is your oyster!<br /><br /><em>Bonus points: make your own set!</em></NewHereLink>
            </td>
          </tr>
        </table>
      </RouterDialog>
    );
  }

  private handleClose = () => { RouterDialog.closeDialog(this.props.history); };
}
