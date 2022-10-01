import Paper from '@material-ui/core/Paper';
import * as React from 'react';
import Helmet from 'react-helmet';

import Background from '../components/Background';
import AnchorLink, { findIdOfCurrentSectionInView, helpPageScrollerId } from '../components/help/AnchorLink';
import HelpSection from '../components/help/HelpSection';
import MarkdownBlock from '../components/MarkdownBlock';
import Title from '../components/Title';
import { HEADER_HEIGHT } from '../constants';

class HowItWorks extends React.Component<Record<string, never>, { currentSectionAnchor?: string }> {
  state = {
    currentSectionAnchor: 'overview'
  };

  private handleScroll = () => {
    this.setState({
      currentSectionAnchor: findIdOfCurrentSectionInView()
    });
  }

  public render = (): JSX.Element => (
    <div className="helpPage" onScroll={this.handleScroll}>
      <Helmet title="How It Works" />
      <Background asset="compressed/image1-1.jpg" opacity={1} style={{ backgroundSize: 'contain' }} />

      <Title text="How It Works" />

      <div>
        <div style={{ margin: '-50px auto 0', padding: '16px 0' }}>
          <Paper
            elevation={5}
            style={{
              width: 'fit-content',
              margin: '0 auto',
              padding: '10px 20px',
              fontSize: '0.9em'
            }}
          >
            <em>Contents:</em>&nbsp;&nbsp;
            <AnchorLink id="overview" currentAnchor={this.state.currentSectionAnchor}>Overview</AnchorLink>
            &nbsp;&bull;&nbsp;
            <AnchorLink id="preprocessing" currentAnchor={this.state.currentSectionAnchor}>Preprocessing</AnchorLink>
            &nbsp;&bull;&nbsp;
            <AnchorLink id="semantic-parse" currentAnchor={this.state.currentSectionAnchor}>Semantic Parse</AnchorLink>
            &nbsp;&bull;&nbsp;
            <AnchorLink id="error-correction" currentAnchor={this.state.currentSectionAnchor}>Error Correction</AnchorLink>
            &nbsp;&bull;&nbsp;
            <AnchorLink id="ast-validation" currentAnchor={this.state.currentSectionAnchor}>AST Validation</AnchorLink>
            &nbsp;&bull;&nbsp;
            <AnchorLink id="code-generation" currentAnchor={this.state.currentSectionAnchor}>Code Generation</AnchorLink>
            &nbsp;&bull;&nbsp;
            <AnchorLink id="execution" currentAnchor={this.state.currentSectionAnchor}>Execution</AnchorLink>
            &nbsp;&bull;&nbsp;
            <AnchorLink id="conclusion" currentAnchor={this.state.currentSectionAnchor}>Conclusion</AnchorLink>
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
          <div style={{ padding: '5px 20px' }}>
            <HelpSection id="overview" title="How Does It Work?">
              <div style={{ float: 'right', maxWidth: 250, marginTop: -60 }}>
                <img src="/static/help/party-dude-preview.png" style={{ width: '100%' }} />
              </div>
              <MarkdownBlock source={overview} />
              <div style={{ maxWidth: '50%', margin: '0 auto' }}>
                <a href="/static/help/how-it-works.png" target="_blank">
                  <img src="/static/help/how-it-works.png" style={{ width: '100%' }} />
                </a>
              </div>
            </HelpSection>

            <HelpSection id="preprocessing" title="Step 1. Preprocessing">
              <MarkdownBlock source={preprocessing} />
            </HelpSection>

            <HelpSection id="semantic-parse" title="Step 2. Semantic Parse">
              <MarkdownBlock source={semanticParse} className="fullSizeImages" />
            </HelpSection>

            <HelpSection id="error-correction" title="Step 2.5. Error Correction">
              <MarkdownBlock source={errorCorrection} />
            </HelpSection>

            <HelpSection id="ast-validation" title="Step 3. AST Validation">
              <MarkdownBlock source={astValidation} />
            </HelpSection>

            <HelpSection id="code-generation" title="Step 4. JavaScript Code Generation">
              <MarkdownBlock source={codeGeneration} />
              <div style={{ maxWidth: '80%', margin: '0 auto' }}>
                <a href="/static/help/js-tree.png" target="_blank">
                  <img src="/static/help/js-tree.png" style={{ width: '100%' }} />
                </a>
              </div>
              <MarkdownBlock source={codeGeneration2} />
            </HelpSection>

            <HelpSection id="execution" title="Step 5. Execution">
              <MarkdownBlock source={execution} />
            </HelpSection>

            <HelpSection id="conclusion" title="Conclusion">
              <MarkdownBlock source={conclusion} />
              <div style={{ maxWidth: '100%', margin: '0 auto' }}>
                <a href="/static/help/how-it-works.png" target="_blank">
                  <img src="/static/help/how-it-works.png" style={{ width: '100%' }} />
                </a>
              </div>
            </HelpSection>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;

const overview = `
So how does Wordbots turn text into playable cards, anyway?

Let's illustrate the process through an example card one may want to make – in this case, a **Party Dude** who, upon entering the board, gives all of your robots **Jump** _(that is, the ability to move over other objects)_:

What happens when you type in \`"Startup: Give all your robots Jump."\` in the text box in the Workshop?

![card text](/static/help/card-text.png)

Below is a graphical overview of the process [_(click to embiggen)_](/static/help/how-it-works.png). Let's go through each of these steps in depth.
`;

const preprocessing = `
First, before we even start doing any parsing magic, Wordbots does some preprocessing operations on the input:
* If there are multiple sentences, the input gets split into individual sentences, which each get parsed separately.
* Certain [words](https://github.com/wordbots/wordbots-core/blob/main/src/common/constants.ts#L174) get substituted for preferred synonyms (e.g. any usage of the word \`"creature"\` gets turned in to \`"robot"\`).
* Any [*keywords*](https://github.com/wordbots/wordbots-core/blob/main/src/common/constants.ts#L196) get expanded out into their meaning (e.g. **\`Defender\`** becomes \`"This robot can't attack"\`, etc.)
* Raw literal strings – that is, names and text that don't mean anything aside from the text itself – get encoded in a special way to play nicely with the parser _(this is used, for example, when you need to name a robot being spawned – i.e., \`Spawn a 1/1/1 robot named "Bob" on a random tile.\`)_
* Finally, the input gets *tokenized* – split into its consituent words and symbols.

In our case we have used two keywords: **\`Startup\`** (= \`"When this object is played,"\`) and **\`Jump\`** (= \`"This robot can move over other objects"\`), so the sentence gets transformed from
\`\`\`
Startup: Give all your robots Jump.
\`\`\`
into:
\`\`\`
When this object is played, Give all your robots "This robot can move over other objects".
\`\`\`

(_Note that the keyword substitution system is smart enough to know that quotes are needed when a keyword is being used to refer to an ability – as **\`Jump\`** is, in this case._)

We don't need to split sentences, replace any synonyms, or encode literal strings in our example, so we can proceed directly to tokenization, which produces this list of tokens:
\`\`\`
when this object is played give all your robots " this robot can move over other objects "
\`\`\`

Now we are ready to parse.
`;

const semanticParse = `
Each sentence gets plugged into the [Wordbots semantic parser](https://github.com/wordbots/wordbots-parser/). This is a CCG parser _("CCG", in this case, refers to the [combinatory categorial grammar](https://en.wikipedia.org/wiki/Combinatory_categorial_grammar) used and has nothing to do with collectible card games ...)_ powered by the [Montague](https://github.com/Workday/upshot-montague) library.

At the heart of the parser lies the [Lexicon](https://github.com/wordbots/wordbots-parser/blob/main/src/main/scala/wordbots/Lexicon.scala#L45), an enormous collection of terms (words and phrases) that the parser understands, each with a corresponding _syntactic_ category (representing where the term can fit in a sentence) and _semantic_ definition (representing what the term actually _means_).

Some example definitions that are relevant to our Party Dude:
* \`"this object"\` has:
  * _**syntax:**_&nbsp;&nbsp;\`NP\` (that is, Noun Phrase)
  * _**semantics:**_&nbsp;&nbsp;\`ThisObject\` (representing a pointer to whatever the salient object is)
* \`"give"\` has several different definitions, but the one that is relevant here is:
  * _**syntax:**_&nbsp;&nbsp;\`(S/S)/NP\` (this is CCG shorthand for _"something that, given a Noun Phrase to the right and then another Sentence to the right of that, produces a Sentence"_)
  * _**semantics:**_&nbsp;&nbsp;\`λ {t: TargetObject => λ {a: Ability => GiveAbility(t, a)}}\` (this is a [lambda-calculus](https://en.wikipedia.org/wiki/Lambda_calculus) expression meaning _"a function that takes a \`TargetObject\` \`t\` and then an \`Ability\` \`a\` and produces the semantic expression \`GiveAbility(t, a)\`"_\`)

Don't worry too much about the funky CCG and lambda-calculus notation – the core idea is that terms have corresponding definitions that define both how they connect together and what they "mean".

Unfortunately, **language is tricky** and there's a lot of ambiguity at play that the parser has to figure out. First off, many terms have lots of different definitions and the right one needs to be chosen that fits the context (the word \`"card"\` alone has 12 different potential definitions ... don't ask). And even trickier, it's not obvious how you'd combine these building blocks together – after all, most of these terms depend on other terms (for example, \`give\` requires a \`TargetObject\` and an \`Ability\`). Fortunately, this is exactly what the Montague CCG parser is good at – it efficiently scans the space of possibilities, and is able to produce this parse [_(click to embiggen)_](/static/help/semantic-parse.png):
[![semantic parse](/static/help/semantic-parse.png)](/static/help/semantic-parse.png)

On the bottom row, you can see the syntax and semantics of the definition that the parser has chosen to work with for each of terms in the sentence. Each row up from there represents terms combining together, building up new, more complex, semantic representations at each stage, until finally the parse gets to the top and encompasses a single Sentence with a complex meaning:
\`\`\`
TriggeredAbility(AfterPlayed(ThisObject), GiveAbility(ObjectsMatchingConditions(Robot, List(ControlledBy(Self))), ApplyEffect(ThisObject, CanMoveOverObjects)))
\`\`\`

Yeah, it's a mouthful, but this is the parser's translation of the sentence \`When this object is played, Give all your robots "This robot can move over other objects"\` into an abstract semantic form. (And this is actually on the _short_ side as far as Wordbots semantic representations go ...)

But hang on, what happens if the parser _isn't_ able to derive a parse? What if we gave it something it doesn't understand?
`;

const errorCorrection = `
Let's take a step back and pretend that we tried to write something a little different, something a little ... wrong. We wanted to say \`Give all your robots Jump\` but instead we wrote \`Give\` **\`to\`** \`all your robots Jump\`.

Now, the word \`"to"\` simply can't be used like that in the Wordbots grammar, so the parser gives up and can't produce a parse.

All is not lost, though! When the parser gives up, the [\`ErrorAnalyzer\`](https://github.com/wordbots/wordbots-parser/blob/main/src/main/scala/wordbots/ErrorAnalyzer.scala) kicks in and tries to figure out if there's an easy way to resolve the error. I won't get into all of the specifics here _(it tries different things based on how complicated the sentence is, and whether the parser thinks the error is syntactic or semantic in nature, etc. etc.)_, but, long story short, the \`ErrorAnalyzer\` does its best-effort job to try adding, removing, or substituting words to make the parse succeed. In this case, it's able to find a solution: just remove the pesky word \`"to"\`!

From the Wordbots user's perspective, this error analysis appears as a helpful "Did You Mean?" hint:

!["Did You Mean?" hint](/static/help/party-dude-did-you-mean.png)

So, let's say we've fixed our text, and let's move on to the next stage: validation.
`;

const astValidation = `
Recall that the parser has produced this somewhat cryptic semantic representation:
\`\`\`
TriggeredAbility(AfterPlayed(ThisObject), GiveAbility(ObjectsMatchingConditions(Robot, List(ControlledBy(Self))), ApplyEffect(ThisObject, CanMoveOverObjects)))
\`\`\`

We can think of this as an _abstract_ meaning representation of our original sentence, and it's a sort of intermediate stage between text and code – it's no longer English, but it isn't some code we can just run yet either. In the long run, this will get turned into executable JavaScript, but first we need to validate that this is a well-formed and meaningful expression.

What do I mean by "well-formed and meaningful"?

Well, there are a surprisingly many different sentences that you could write that, while certainly "parse-able" (that is, valid from a grammar standpoint), don't really correspond to something that you can do in Wordbots.

For example, here are some sentences that don't really make sense from an in-game standpoint,
* \`"At the start of your turn, deal 3 damage to a robot"\` – The start of the turn is an automatic trigger, so there's no way for the player to choose which robot to deal damage to here! _(Note that \`"deal 3 damage to all robots"\` or \`"to a random robot"\` is totally fine – the issue is with asking for user choice in a triggered ability.)_
* \`"Reduce the energy cost of all robots in play by 2"\` – While changing the cost of cards-in-hand makes sense, changing the cost of objects _already on the board_ is meaningless – their energy cost doesn't matter because they've already been played!

And more fundamentally, the text on robot/structure cards and action cards is fundamentally different: action cards represent one-time **actions** (like, \`"Draw 3 cards"\`), while robot and structure cards have **passive abilities** (like \`"Adjacent robots have +2 health"\`)  or **triggered abilities** (like, \`"Whenever this robot moves, draw a card"\`) or **activated abilities** (like \`"Activate: Draw a card"\`).

So, we need some way to enforce rules about what kinds of semantic structures are not allowed, based on the card type.

This is where the [\`AstValidator\`](https://github.com/wordbots/wordbots-parser/blob/main/src/main/scala/wordbots/AstValidator.scala) comes into play.

Basically, it takes our semantic expression that the parser produced, and examines it as a tree-structure:
![ast.png](/static/help/ast.png)

Each "validation rule" now traverses the tree and checks for specific disallowed patterns (for example, a \`Choose\` expression inside a \`TriggeredAbility\` block, which would violate the _"no player-chosen targeting during trigger activation"_ rule).

If a validation rule fails, this also triggers the \`ErrorAnalyzer\`! So, if we had, for example tried to make a robot with just the text \`"Give all your robots Jump"\` (fine for an Action card, but not valid text for a Robot card because it's not an _ability_), we would get this helpful suggestion:

![validation rule suggestion example](/static/help/party-dude-validation.png)
`;

const codeGeneration = `
Now that our abstract semantic representation has made it safely through the \`AstValidator\`, it's time to turn it into JavaScript!

This is the work of the [\`CodeGenerator\`](https://github.com/wordbots/wordbots-parser/blob/main/src/main/scala/wordbots/CodeGenerator.scala), and it's fairly straightforward: just like the \`AstValidator\`, it treats the semantic representation as an abstract tree, and recurses through the tree, generating scary-looking JavaScript as it goes along.

For example,
\`\`\`
toJS(TriggeredAbility(trigger, action)) = "(function () { setTrigger(\${toJS(trigger)}, \${toJS(action)}); })"
toJS(AfterPlayed(object)) = "triggers['afterPlayed'](function () { return \${toJS(targetObj)}; })"
\`\`\`
and so on and so forth.

With this, we can recurse all the way through the tree structure of the semantic representation, from
![ast.png](/static/help/ast.png)
to [_(click to embiggen)_](/static/help/js-tree.png):
`;

const codeGeneration2 = `
Finally our semantic representation \`TriggeredAbility(AfterPlayed(ThisObject), GiveAbility(ObjectsMatchingConditions(Robot, List(ControlledBy(Self))), ApplyEffect(ThisObject, CanMoveOverObjects)))\` gets transformed into real-life JavaScript code:
\`\`\`
(function () { setTrigger(triggers['afterPlayed'](function () { return targets['thisRobot'](); }), (function () { actions['giveAbility'](objectsMatchingConditions('robot', [conditions['controlledBy'](targets['self']())]), \\"(function () { setAbility(abilities['applyEffect'](function () { return targets['thisRobot'](); }, 'canmoveoverobjects')); })\\"); })); })
\`\`\`

Well, I didn't say it was going to be good-looking JavaScript code.
`;

const execution = `
This is the point at which the Wordbots "parser" _(really more of an all-in-one parser+validator+code generator, as we've now seen)_ hands back control to the game itself. The mess of JavaScript produced gets stored within the card that we have just created.

So, what happens when we try to play this card in an actual game?

Well, we just run the generated code (via \`eval()\`, of course), plugging into it the Wordbots [client-side vocabulary](https://github.com/wordbots/wordbots-core/blob/main/src/common/vocabulary/vocabulary.ts) implementation, that defines what things like \`setTrigger\` and \`targets['thisRobot']\`, etc, all _actually do_ in the game itself.

Of course, it's a little more complicated than that:
* The actual implementations of all of these things – \`actions\` and \`targets\` and \`triggers\` and so on – end up depending on the object performing the action (if any), and sometimes even depending on how the object got the ability in question (if any). So, the vocabulary bundle has to be re-generated every time we need to execute Wordbots code (for example, any time a card is played or an ability is used).
* Actions and abilities are represented as JavaScript functions, but of course they in turn contain references to _other_ actions and abilities, which have to be represented as functions themselves! _(For example, the "Jump" ability that our robot is bestowing on other robots is itself represented as a function.)_ Usually these get represented as stringified functions, but sometimes as functions returning stringified functions, depending on exactly what order things need to execute in a given context. Sometimes these things can get nested quite a few levels deep (and become completely unreadable as a result).
* The \`CodeGenerator\` acts as a last-ditch bulwark of sanity by trying to execute the JavaScript code produced (using [Mozilla Rhino](https://github.com/mozilla/rhino)), to make sure it's even valid JavaScript. It does the same thing for every function-inside-a-function it can find inside the code too, executing each in turn to make sure it's valid JavaScript functions all the way down.
* The Wordbots command-execution system is also a little more sophisticated than a simple \`eval()\` statement – among other things, it keeps track of its own execution stack depth in order to detect infinite loops caused by card behavior. _(These typically happens if two triggers manage to trigger one another ad infinitum – it's a rare situation and causes the game to end in a draw – perhaps Wordbots's most obscure game rule.)_
* And of course things get even more exciting with Wordbots cards that modify the text of other cards, a new mechanic that makes it so cards can now trigger a re-parse of other cards in the middle of execution. All sorts of madness can now ensue, through cards like this:
![polarity-shift.png](/static/help/polarity-shift.png)
`;

const conclusion = `
Well, that's it. Another day at the ol' bot factory.

Once again, here's the graphical overview [_(click to embiggen)_](/static/help/how-it-works.png):
`;

/**
digraph G {
  node [shape=plaintext];
  TriggeredAbility -> AfterPlayed;
  TriggeredAbility -> GiveAbility;
  AfterPlayed -> ThisObject;
  GiveAbility -> ObjectsMatchingConditions;
  GiveAbility -> ApplyEffect;
  ObjectsMatchingConditions -> Robot;
  ObjectsMatchingConditions -> List;
  List -> ControlledBy;
  ControlledBy -> Self;
  ApplyEffect -> ThisObject2;
  ThisObject2 [label="ThisObject"];
  ApplyEffect -> CanMoveOverObjects;
}

digraph G {
  node [shape=plaintext];
  ranksep=0.3;

  TriggeredAbility [label="(function () { setTrigger( ☐, ☐ ); })"]
  TriggeredAbility -> AfterPlayed;
  TriggeredAbility -> GiveAbility;
  AfterPlayed [label="triggers['afterPlayed'](function () { return ☐; })"]
  AfterPlayed -> ThisObject;
  GiveAbility [label="(function () { actions['giveAbility'](☐, \"☐\"); })"]
  GiveAbility -> ObjectsMatchingConditions;
  GiveAbility -> ApplyEffect;
  ObjectsMatchingConditions [label="objectsMatchingConditions(☐, ☐)"]
  ObjectsMatchingConditions -> Robot;
  ObjectsMatchingConditions -> List;
  List [label="[☐]"]
  List -> ControlledBy;
  ControlledBy [label="conditions['controlledBy'](☐)"]
  ControlledBy -> Self;
  ApplyEffect [label="(function () { setAbility(abilities['applyEffect'](function () { return ☐; }, ☐)); })"]
  ApplyEffect -> ThisObject2;
  ThisObject [label="targets['thisRobot']()"]
  ThisObject2 [label="targets['thisRobot']()"]
  ApplyEffect -> CanMoveOverObjects;
  Self [label="targets['self']()"]
  Robot [label="'robot'"]
  CanMoveOverObjects [label="'canmoveoverobjects'"]
}
 */
