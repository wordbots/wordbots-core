import Paper from '@material-ui/core/Paper';
import { truncate } from 'lodash';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import Background from '../components/Background';
import MarkdownBlock from '../components/MarkdownBlock';
import Title from '../components/Title';
import * as w from '../types';

interface AboutProps {
  version: string
}

export function mapStateToProps(state: w.State): AboutProps {
  return {
    version: state.version
  };
}

class About extends React.PureComponent<AboutProps> {
  public render(): JSX.Element {
    const [version, sha] = this.props.version.split('+');
    const shaTruncated = truncate(sha, { length: 8, omission: '' });

    return (
      <div className="helpPage">
        <Helmet title="About" />
        <Background asset="compressed/image1-1.jpg" opacity={1} style={{ backgroundSize: 'contain' }} />

        <Title text="About" />

        <div style={{ display: 'flex', justifyContent: 'stretch', margin: '20px auto', width: '84%' }}>
          <div style={{ width: '50%', marginRight: 20 }}>
            <Paper style={{ padding: '5px 20px' }}>
              <h2>Wordbots v<a href="https://github.com/wordbots/wordbots-core/releases/tag/v${version}">{version}</a>+{shaTruncated}</h2>
              <div style={{ display: 'flex', gap: 10 }}>
                <div>
                  <img src="/static/splash-workshop.png" style={{ maxWidth: '100%' }} />
                </div>
                <div>
                  <img src="/static/splash-play.png" style={{ maxWidth: '100%' }} />
                </div>
              </div>
              <MarkdownBlock source={whatIsWordbots} />
            </Paper>

            <Paper style={{ padding: '5px 20px', marginTop: 20 }}>
              <MarkdownBlock source={statusReport} />
            </Paper>

            <Paper style={{ padding: '5px 20px', marginTop: 20 }}>
              <MarkdownBlock source={howItWorks} />
            </Paper>
          </div>

          <div style={{ width: '50%' }}>
            <Paper style={{ padding: '5px 20px' }}>
              <MarkdownBlock source={credits} />
            </Paper>

            <Paper style={{ padding: '5px 20px', marginTop: 20 }}>
              <MarkdownBlock source={getInvolved} />
            </Paper>
          </div>
        </div>

        <div
          style={{ margin: '20px auto', width: '84%', textAlign: 'center' }}
        >
          <img
            src="/static/artAssets/dome2.png"
            style={{
              width: 800, height: 600,
              objectFit: 'cover', objectPosition: '0 85%',
              borderRadius: 10, boxShadow: '0px 1px 5px 0px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 3px 1px -2px rgb(0 0 0 / 12%)'
            }}
          />
        </div>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps)(About));

const whatIsWordbots = `
**Wordbots** is a customizable hex-based card game with a twist – _you_, the player,
get to create the cards!

The basic gameplay of Wordbots is that of a positional card game (think Hearthstone, Faeria, or Duelyst).
The fact that players make their own cards makes Wordbots games rather wild and unpredictable, and also
introduces behaviors that are not possible in other games, such as cards being able to _rewrite_ other cards mid-game.

Wordbots started as an experiment in semantic parsing, way back in 2016. It has since spiraled into a very-long-term side project.
I guess making a multiplayer game is kind of complicated!
`;


const statusReport = `
## What's the status of Wordbots? Is it "done"? Will it ever be?

Wordbots is currently in **late alpha / early beta** (but it will probably forever retain the "beta" designation).

It's more or less "feature-complete", in the sense that:
* the parser works decently well at what it does; and
* there are a variety of fully-fledged gameplay formats, some more balanced than others

Is it a "game"? It's certainly playable! Of course, it's not going to be the next Hearthstone (how could it, given its premise?).
The goal is perhaps for it to land somewhere in the middle between "cool tech demo" and "successful multiplayer game".

You can check out [Wordbots's version history on GitHub](https://github.com/wordbots/wordbots-core/releases).
`;

const howItWorks = `
## How does it work?

[Glad you asked! There's a whole separate page explaining the magic.](/how-it-works)
`;
const getInvolved = `
## Get involved!

* Join us on [our Discord channel](http://discord.wordbots.io) to discuss Wordbots. This is the place to go with any general questions or comments about Wordbots – we'd love to hear your feedback!

* Technical folks, follow the development of the game on [GitHub](http://git.wordbots.io).
Feel free to add issues or even make a pull request if you're feeling brave.
Interested in starter issues? Reach out on [our Discord](http://discord.wordbots.io)!
`;

const credits = `
## Credits

Wordbots was created by:

* [**Alex Nisnevich**](https://alex.nisnevich.com/) – concept, parser, frontend
* [**Jacob Nisnevich**](https://github.com/jacobnisnevich) – frontend, design

with help from:

* [Chris Wooten](https://www.artstation.com/christopherwooten) – art
* [John Patterson](https://www.johnppatterson.com/) - consultation, code contributions, voice acting
* [Danny Burt](http://dbz.rocks/), [Bryan Hoyt](https://github.com/bryanftw), [Michael Ebert](https://github.com/MichaelEbert), [Tim Hwang](https://timhwang21.gitbook.io/index/) – consultation, [code contributions](https://github.com/wordbots/wordbots-core/graphs/contributors)
* Asali Echols, James Silvey, Annie Nisnevich – extensive playtesting
* Adam B, Alex B, Daniel M, Drew T, Erik K, Greg S, Honza H, John B, Liam D – playtesting

The Wordbots parser is built on top of the [\`Montague\` semantic parsing engine](https://github.com/Workday/upshot-montague),
by Thomas Kim, [Joseph Turian](https://github.com/turian), and [Alex Nisnevich](https://alex.nisnevich.com/).

The Wordbots frontend incorporates/vendors the following (MIT- and WTFPL-licensed) projects:

* [\`react-hexgrid\`](https://github.com/hellenic/react-hexgrid) by [Hannu Kärkkäinen](https://github.com/Hellenic)
* [\`spritegen\`](https://gitlab.com/not_surt/spritegen) by [Carl Olsson](https://gitlab.com/not_surt)
* [\`identicons-react\`](https://github.com/gimenete/identicons-react) by [Alberto Gimeno](https://github.com/gimenete)

Wordbots uses the following fonts and icon fonts:

* [Carter One](https://fonts.google.com/specimen/Carter+One) by
[Vernon Adams](https://fonts.google.com/?query=Vernon%20Adams), courtesy of Google Fonts
* [VT323](https://fonts.google.com/specimen/VT323) by [Peter Hull](https://fonts.google.com/?query=Peter%20Hull), courtesy of Google Fonts
* [Roboto](https://fonts.google.com/specimen/Roboto) by [Christian Robertson](https://fonts.google.com/?query=Christian%20Robertson), courtesy of Google Fonts
* [Space Age](https://www.1001fonts.com/space-age-font.html) by [Justin Callaghan](https://www.1001fonts.com/users/jcmagic/), courtesy of [1001 Fonts](https://www.1001fonts.com/)
* [Material Icons](https://mui.com/components/material-icons/) by Google
* [RPG-Awesome Icons](https://nagoshiashumari.github.io/Rpg-Awesome/) by [Game-Icons.net](https://game-icons.net/), [Daniela Howe](https://github.com/nagoshiashumari), and [Ivan Montiel](https://github.com/idmontie)

_No LLMs were used in the making of Wordbots._

`;

/* (No longer needed now that we have the New Here? widget on the homepage? -AN)
const howToPlay = `
## How to Play

### Try the Tutorial
The 10-minute [interactive tutorial](/play) is the easiest way to
get started with Wordbots.

You'll learn the rules of game, how to play cards, and how to move
and attack with your robots on the board.

### Create Your Cards
Check out the built-in cards in your [collection](/collection),
then make your own custom cards in the [workshop](/card/new).

### Make a Deck
Use the [deck builder](/decks) to create a deck of 30 cards.
_(You can use as many copies of a card as you'd like.)_

You can test out your deck against the AI in [practice mode](/play) to see
how well it works.

### Defeat Your Opponents
Go to the [lobby](/play), choose your deck, and host or join a game.

Destroy your opponent's kernel to win!
`;
*/
