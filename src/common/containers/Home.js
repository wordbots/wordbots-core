import React, { Component } from 'react';
import { bool, string } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Paper from 'material-ui/Paper';

import MarkdownBlock from '../components/MarkdownBlock';

export function mapStateToProps(state) {
  return {
    version: state.version,
    sidebarOpen: state.layout.present.sidebarOpen
  };
}

class Home extends Component {
  static propTypes = {
    version: string,
    sidebarOpen: bool
  };

  render() {
    return (
      <div style={{
        paddingLeft: this.props.sidebarOpen ? 256 : 0,
        margin: '48px 72px'
      }}>
        <Helmet title="Home"/>

        <div style={{display: 'flex', justifyContent: 'stretch'}}>
          <div style={{width: '50%', marginRight: 20}}>
            <Paper style={{padding: '5px 20px'}}>
              <MarkdownBlock source={whatIsWordbots(this.props.version)} />
            </Paper>

            <Paper style={{padding: '5px 20px', marginTop: 20}}>
              <MarkdownBlock source={leaveYourFeedback} />
            </Paper>
          </div>

          <div style={{width: '50%'}}>
            <Paper style={{padding: '5px 20px'}}>
              <MarkdownBlock source={howToPlay} />
            </Paper>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps)(Home));

const whatIsWordbots = (version) => (`
# Wordbots ${version}
![](http://app.wordbots.io/static/screenshot_mini.png)
**Wordbots** is a customizable hex-based card game with a twist – _you_, the player,
get to create the cards!

Wordbots is currently in **alpha**.
We _have_ a working (but not fully complete) parser for card text, basic gameplay functionality, and a lobby for multiplayer gameplay.
We _don't_ currently have any mechanism to ensure that cards are reasonably balanced –
that's still something we're brainstorming.

Wordbots is under active development.
Follow our progress on [GitHub](https://github.com/wordbots).
`);

const leaveYourFeedback = `
## Leave Your Feedback
Got comments or questions? Is something not working? Are some elements of the game confusing?

Is a card not parsing correctly when it should?
_(This in particular is important to us at this stage.)_

We want your feedback. Please fill out
[this form](https://docs.google.com/forms/d/e/1FAIpQLSed43Rc8HcdZug7uW8Jdxsa6CpHP8kQLnioIz_tiFos2NvMtQ/viewform?usp=sf_link)
on your way out.

_P.S. GitHub savvy people – feel free to
[create issues](https://github.com/wordbots/wordbots-core/issues)
for us._
`;

const howToPlay = `
## How to Play

### Create Your Cards
Check out the built-in cards in your [collection](/collection),
then make your own custom cards using the [card creator](/creator).

### Make a Deck
Use the [deck builder](/decks) to create a deck of 30 cards.
_(You can use as many copies of a card as you'd like.)_

### Defeat Your Opponents
Go to the [lobby](/game), choose your deck, and host or join a game.

During your turn, you can play events, place robots and structures,
and move and attack with your robots on the board.
Destroy your opponent's kernel to win!
`;
