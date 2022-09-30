import { Icon } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { Location } from 'history';
import * as React from 'react';
import Helmet from 'react-helmet';

import { HEADER_HEIGHT } from '../constants';
import AnchorLink, { helpPageScrollerId } from '../components/help/AnchorLink';
import Background from '../components/Background';
import MarkdownBlock from '../components/MarkdownBlock';
import Title from '../components/Title';
import { helpText as parserHelpText } from '../components/help/CreatorHelpDialog';
import { BUILTIN_FORMATS, GameFormat, SetFormat, SetDraftFormat } from '../util/formats';
import HelpSection from '../components/help/HelpSection';

const Help = (): JSX.Element => (
  <div className="helpPage">
    <Helmet title="Help" />
    <Background asset="compressed/image1-1.jpg" opacity={1} style={{ backgroundSize: 'contain' }} />

    <Title text="Help" />

    <div style={{ margin: '-50px auto 0', padding: '16px 0' }}>
      <Paper
        elevation={5}
        style={{
          width: 'fit-content',
          margin: '0 auto',
          padding: '10px 20px'
        }}
      >
        <em>Contents:</em>&nbsp;&nbsp;
        <AnchorLink id="rules">Rules</AnchorLink>
        &nbsp;&bull;&nbsp;
        <AnchorLink id="terminology">Terminology</AnchorLink>
        &nbsp;&bull;&nbsp;
        <AnchorLink id="formats">Formats</AnchorLink>
        &nbsp;&bull;&nbsp;
        <AnchorLink id="modes">Modes</AnchorLink>
        &nbsp;&bull;&nbsp;
        <AnchorLink id="parser-help">Parser Help</AnchorLink>
      </Paper>
    </div>
    <div
      id={helpPageScrollerId}
      style={{
        height: `calc(100vh - ${HEADER_HEIGHT + 70}px)`,
        overflowY: 'scroll',
        width: '84%',
        margin: '0 auto'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'stretch' }}>
        <div style={{ width: '50%', marginRight: 20 }}>
          <HelpSection id="rules" title="Game Rules">
            <MarkdownBlock
              source={gameRules}
              renderers={{ thematicBreak: RulesHr, inlineCode: InlineIcon }}
            />
          </HelpSection>
          <HelpSection id="formats" title="Game Formats">
            <p>Wordbots offers {BUILTIN_FORMATS.length + 2} different game formats for different gameplay styles, with each format determining the cards that you can bring to a game. The formats are:</p>
            <ul>
              {BUILTIN_FORMATS.map((format: GameFormat) => (
                <li key={format.displayName}><b>{format.displayName}:</b> {format.description}</li>
              ))}
              <li><b>Set formats:</b> {SetFormat.description}</li>
              <li><b>Set Draft formats:</b> {SetDraftFormat.description}</li>
            </ul>
          </HelpSection>
          <HelpSection id="modes" title="Game Modes">
            <p>The <b>multiplayer</b> game modes available in Wordbots are:</p>
            <ul>
              <li>
                <b>Casual: </b>
                Host a game in a format of your choice, or join an open game in the arena.
                Casual games can be password-protected if you want to play a friend.
                Spectators can also join to watch the game being played.
              </li>
              <li>
                <b>Matchmaking: </b>
                Select a format and wait in a queue to be matched against another player.
              </li>
            </ul>
            <p>The <b>single-player</b> game modes available in Wordbots are:</p>
            <ul>
              <li><b>Tutorial:</b> Play through an interactive tutorial to learn how to play Wordbots.</li>
              <li><b>Practice:</b> Select a deck and play a practice game against a computer player.</li>
              <li>
                <b>Sandbox: </b>
                Control both players and play any Wordbots card you&rsquo;d like.
                Sandbox mode is especially useful for testing out cards you&rsquo;re building in the Workshop.
              </li>
            </ul>
          </HelpSection>
        </div>
        <div style={{ width: '50%' }}>
          <HelpSection id="terminology" title="Terminology">
            <MarkdownBlock
              source={terminology}
              renderers={{ thematicBreak: RulesHr, inlineCode: InlineIcon, paragraph: TerminologyParagraph }}
            />
          </HelpSection>
          <HelpSection id="parser-help" title="Parser Help">
            <MarkdownBlock source={parserHelpText({ pathname: '/card/new' } as Location)} />
          </HelpSection>
        </div>
      </div>
    </div>
  </div>
);

// eslint-disable-next-line react/no-multi-comp
const TerminologyParagraph = (props: { children: JSX.Element[] }): JSX.Element => (
  <p style={{ marginBlockStart: '0.4em', marginBlockEnd: '0.4em' }}>{props.children}</p>
);

// eslint-disable-next-line react/no-multi-comp
const RulesHr = (): JSX.Element => (
  <hr style={{ border: '0.5px solid rgb(0, 188, 212)', margin: '4px 0' }} />
);

// eslint-disable-next-line react/no-multi-comp
const InlineIcon = (props: { children: string }): JSX.Element => (
  <Icon
    className={props.children}
    style={{ position: 'relative', top: 2, fontSize: 16, lineHeight: 1.2 }}
  />
);

export default Help;

const gameRules = `
---

### The Basics

You start the game with a **kernel** with 20 **health**, 2 cards in your hand, and 1 **energy**.

You win the game by **destroying** your opponent's **kernel**. You lose the game if your own kernel gets destroyed. If both player's kernels are destroyed at the same time (e.g. by a card's ability), the game ends in a draw.

At the start of your turn, you:

- draw one card (up to a max of 7)
- increase your **maximum energy** by 1 (up to a max of 10),
- and recharge your **energy** to its maximum level.

There are two things you can do on your turn:

- (1) you can play cards, and
- (2) you can move, attack, or **activate** each of your objects on the board.

---

### Playing Cards

There are three types of cards: **actions**, **robots**, and **structures**. Actions are one-time effects that trigger instantly, while robots and structures are objects that get placed on the board.

To play an **action** card, click on the card in your hand, then click on the board. Some action cards require you to select one or more objects or tiles on the board for their ability. Other action cards just need you to click anywhere on the board to confirm that you want to play them.

To play a **robot** or **structure** card, click on the card in your hand, then click on where you want to place that robot or structure.

- Robots can be played on any of the light-colored spaces on your side of the board.
- Structures can be played adjacent to any of your existing robots, structures, or **kernel**.

---

### Using Objects

Each of your **robots** and **structures** on the board can be used each turn. Robots can move, attack, and **activate**. Structures can activate, but cannot move or attack.

Robots and structures that you have just placed on the board this turn cannot move, attack, or activate -- unless they have the **"Haste" **keyword (or some other ability that lets them do so).

To move a robot, click on it and click on a green destination space for it to go. Robots can move up to a number of spaces equal to their **Speed** stat (\`ra ra-shoe-prints\`). A robot can attack after moving, but cannot move after attacking.

To attack with a robot, click on it and click on a target object to attack (highlighted in red). If the robot is not adjacent to its target, it will first move in that direction until it's adjacent to the target and then attack. When a robot attacks, it deals damage equal to its **Attack** stat (\`ra ra-crossed-swords\`) to its target's **Health** stat (\`ra ra-health\`). If the target's Health goes to zero, it is destroyed, and your robot moves to the target's location. An object cannot move or **activate** after attacking.

To **activate** an object's ability, click on the object and then click on the ability to activate. An object cannot attack after activating an ability.

---

`;

const terminology = `
---

**action**

A one-time-use card whose effect immediately happens when you play it.

---

**activate**

Some **robots** and **structures** have an "Activate" ability _(for example: "**Activate**: Draw a card")_. Each robot or structure's Activate ability can be used once per turn, but a robot cannot activate and attack on the same turn.

---

**attack**

A **robot**'s Attack stat (\`ra ra-crossed-swords\`) indicates how much damage it deals when attacking another **object**.

---

**cost**

A card's Cost stat (the number in the blue circle) indicates how much **energy** is required to play that card.

---

**destroyed**

An **object** can be destroyed when its **health** goes to 0, or when a card is played that destroys it. Destroyed objects leave the board and go to the **discard pile**.

---

**discard pile**

Your discard pile holds **action** cards that you've played and your **objects** that have been **destroyed**.

---

**energy**

The resource used to play cards. Every turn, your energy recharges up to your **maximum energy** level.

---

**health**

An **object**'s Health (\`ra ra-health\`) stat indicates how much damage it can take before being **destroyed**.

---

**kernel**

Each player starts the game with one Kernel, and when your Kernel is **destroyed**, you lose the game.

---

**maximum energy**

The amount to which your **energy** recharges each turn. Each player starts with 1 maximum energy and increases it by 1 at the start of each turn (up to a limit of 10).

---

**object**

An object on the board. There are three types of objects: **robots**, **structures**, and **kernels**.

---

**robot**

A card that is played onto the board and can move, attack, and **activate**.

---

**speed**

A **robot**'s Speed stat (\`ra ra-shoe-prints\`) indicates how many spaces on the board it can move each turn.

---

**structure**

A card that is played onto the board and can **activate**, but cannot move or attack.

---
`;
