import * as React from 'react';
import { string } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Paper from '@material-ui/core/Paper';

import Title from '../components/Title';
import MarkdownBlock from '../components/MarkdownBlock';

export function mapStateToProps(state) {
  return {
    version: state.version
  };
}

const About = function (props) {
  const [version, sha] = props.version.split('+');

  return (
    <div>
      <Helmet title="About"/>
      <Title text="About" />

      <div style={{display: 'flex', justifyContent: 'stretch', margin: 20}}>
        <div style={{width: '50%', marginRight: 20}}>
          <Paper style={{padding: '5px 20px'}}>
            <MarkdownBlock source={whatIsWordbots(version, sha)} />
          </Paper>

          <Paper style={{padding: '5px 20px', marginTop: 20}}>
            <MarkdownBlock source={getInvolved} />
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
};

About.propTypes = {
  version: string
};

export default withRouter(connect(mapStateToProps)(About));

const whatIsWordbots = (version, sha) => (`
# Wordbots [${version}](https://github.com/wordbots/wordbots-core/releases/tag/v${version})+${sha}
![](http://app.wordbots.io/static/screenshot_mini.png)
**Wordbots** is a customizable hex-based card game with a twist – _you_, the player,
get to create the cards!

Wordbots is currently in **alpha**.
We _have_ a working (but not fully complete) parser for card text, basic gameplay functionality, and a lobby for multiplayer gameplay.
We _don't_ currently have any mechanism to ensure that cards are reasonably balanced –
that's still something we're brainstorming.
`);

const getInvolved = `
## Get Involved!

Interested in Wordbots? There are many ways you can get involved:

1. Join us on [our Discord channel](http://discord.wordbots.io) to discuss Wordbots.

2. Got comments or questions? Is something not working? Are some elements of the game confusing?
[Fill out our feedback form](https://docs.google.com/forms/d/e/1FAIpQLSed43Rc8HcdZug7uW8Jdxsa6CpHP8kQLnioIz_tiFos2NvMtQ/viewform?usp=sf_link)
to let us know.

3. Technical folks, follow the development of the game on [GitHub](http://git.wordbots.io).
Feel free to add issues or even make a pull request if you're feeling brave.

4. Last but not least, donations enable us to keep working on Wordbots, so if you're feeling generous,
[send a dollar or two our way on Patreon](https://www.patreon.com/wordbots).
`;

const howToPlay = `
## How to Play

### Try the Tutorial
The 10-minute [interactive tutorial](/play) is the easiest way to
get started with Wordbots.

You'll learn the rules of game, how to play cards, and how to move
and attack with your robots on the board.

### Create Your Cards
Check out the built-in cards in your [collection](/collection),
then make your own custom cards using the [card creator](/creator).

### Make a Deck
Use the [deck builder](/decks) to create a deck of 30 cards.
_(You can use as many copies of a card as you'd like.)_

You can test out your deck against the AI in [practice mode](/play) to see
how well it works.

### Defeat Your Opponents
Go to the [lobby](/play), choose your deck, and host or join a game.

Destroy your opponent's kernel to win!
`;
