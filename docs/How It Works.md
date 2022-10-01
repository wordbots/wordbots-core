# How Does it Work?

So how does Wordbots turn text into playable cards, anyway?

Let's illustrate the process through an example card one may want to make – in this case, a **Party Dude** who, upon entering the board, gives all of your robots **Jump** _(that is, the ability to move over other objects)_:

![Screen Shot 2022-07-31 at 10.38.34 2 PM.png](https://www.dropbox.com/s/jkqhij30kiyf15m/Screen%20Shot%202022-07-31%20at%2010.38.34%202%20PM.png?dl=0&raw=1)

What happens when you type in `"Startup: Give all your robots Jump."` in the text box in the Workshop?

![Screen Shot 2022-07-31 at 10.48.18 PM.png](https://www.dropbox.com/s/yw1ppk6r6n1l45y/Screen%20Shot%202022-07-31%20at%2010.48.18%20PM.png?dl=0&raw=1)

## Step 1. Keyword Substitution

First, Wordbots substitutes any recognized keyword expressions, before sending the text off to the parser.

In our case we have used two keywords: **`Startup`** (= `When this object is played,`) and **`Jump`** (= `This robot can move over other objects`), so the sentence ultimately gets transformed from `"Startup: Give all your robots Jump."` into:
```
When this object is played, Give all your robots "This robot can move over other objects".
```

Note that the keyword substitution system is smart enough to know that quotes are needed when a keyword is being used to refer to an ability (as **`Jump`** is, in this case).

This is also the part where the text is split into separate sentences, to be parsed separately. In our case, we only have one sentence anyway, so no splitting happens.

## Step 2. Semantic Parse

Each sentence gets plugged into the [Wordbots semantic parser](https://github.com/wordbots/wordbots-parser/). This is a CCG parser _("CCG", in this case, refers to [the type of grammar](https://en.wikipedia.org/wiki/Combinatory_categorial_grammar) used and has nothing to do with collectible card games ...)_ powered by the [Montague](https://github.com/Workday/upshot-montague) library.

At the heart of the parser lies the [Lexicon](https://github.com/wordbots/wordbots-parser/blob/main/src/main/scala/wordbots/Lexicon.scala), an enormous collection of words and phrases that the parser understands, each with a corresponding _syntactic_ definition (where the word/phrase can fit in a sentence) and _semantic_ definition (what the word/phrase actually _means_).

Some example definitions that are relevant to our Party Dude:
* `"this object"` has syntax `NP` (that is, Noun Phrase) and semantics `ThisObject` (think of this as just a pointer to whatever the current object in question is)
* `"give"` has several different definitions, but the one that is relevant here is syntax `(S/S)/NP` (this is CCG shorthand for _"something that, given a Noun Phrase to the right and then another Sentence to the right of that, becomes a Sentence"_) and semantics `λ {t: TargetObject => λ {a: Ability => GiveAbility(t, a)}}` (this is a [lambda-calculus](https://en.wikipedia.org/wiki/Lambda_calculus) expression meaning _"a function that takes a `TargetObject` `t` and then an `Ability` `a` and produces the semantic expression `GiveAbility(t, a)`"_`)

Don't worry too much about the funky CCG and lambda-calculus notation – the core idea is that words and phrases have corresponding definitions that define both how they connect together and what they "mean".

Unfortunately, **language is tricky** and there's a lot of ambiguity at play that the parser has to figure out. First off, many words and phrases have lots of different definitions and the right one needs to be chosen that fits the context (the word `"card"` alone has 12 different potential definitions ... don't ask). And even trickier, it's not obvious how you'd combine these building blocks together – after all, most of these phrases depend on other phrases (for example, `give` requires a `TargetObject` and an `Ability`). Fortunately, this is exactly what the Montague CCG parser is good at – it efficiently scans the space of possibilities, and is able to produce this parse:
![image2.png](https://www.dropbox.com/s/ukq5p5yu6tnk4mn/image2.png?dl=0&raw=1)

On the bottom row, you can see the syntax and semantics of the definition that the parser has chosen to work with for each of terms in the sentence. Each row up from there represents terms combining together, building up new, more complex, semantic representations at each stage, until finally the parse gets to the top and encompasses a single Sentence with a complex meaning:
```
TriggeredAbility(AfterPlayed(ThisObject), GiveAbility(ObjectsMatchingConditions(Robot, List(ControlledBy(Self))), ApplyEffect(ThisObject, CanMoveOverObjects)))
```

Yeah, it's a mouthful, but this is the parser's translation of the sentence `When this object is played, Give all your robots "This robot can move over other objects".` into an abstract semantic form. (And this is actually on the _short_ side as far as Wordbots semantic representations go ...)

But hang on, what happens if the parser _isn't_ able to derive a parse? What if we gave it something it doesn't understand?

## Step 2.5. Error Correction

Let's take a step back and pretend that we tried to write something a little different, something a little ... wrong. We wanted to say `Give all your robots Jump` but instead we wrote `Give` **`to`** `all your robots Jump`.

Now, the word `"to"` simply can't be used like that in the Wordbots grammar, so the parser gives up and can't produce a parse.

All is not lost, though! When the parser gives up, the [`ErrorAnalyzer`](https://github.com/wordbots/wordbots-parser/blob/main/src/main/scala/wordbots/ErrorAnalyzer.scala) kicks in and tries to figure out if there's an easy way to resolve the error. I won't get into all of the specifics here _(it tries different things based on how complicated the sentence is, and whether the parser thinks the error is syntactic or semantic in nature, etc. etc.)_, but, long story short, the `ErrorAnalyzer` does its best-effort job to try adding, removing, or substituting words to make the parse succeed. In this case, it's able to find a solution: just remove the pesky word `"to"`!

From the Wordbots user's perspective, this error analysis appears as a helpful "Did You Mean?" hint:

![image1.png](https://www.dropbox.com/s/dw0eyq1ejvyrsws/image1.png?dl=0&raw=1)

So, let's say we've fixed our text, and let's move on to the next stage: validation.

## Step 3. AST Validation

Recall that the parser has produced this somewhat cryptic semantic representation:
```
TriggeredAbility(AfterPlayed(ThisObject), GiveAbility(ObjectsMatchingConditions(Robot, List(ControlledBy(Self))), ApplyEffect(ThisObject, CanMoveOverObjects)))
```

We can think of this as an _abstract_ meaning representation of our original sentence, and it's a sort of intermediate stage between text and code – it's no longer English, but it isn't some code we can just run yet either. In the long run, this will get turned into executable JavaScript, but first we need to validate that this is a well-formed and meaningful expression.

What do I mean by "well-formed and meaningful"?

Well, there are a surprisingly many different sentences that you could write that, while certainly "parse-able" (that is, valid from a grammar standpoint), don't really correspond to something that you can do in Wordbots.

For example, here are some sentences that don't really make sense from an in-game standpoint,
* `"At the start of your turn, deal 3 damage to a robot"` – The start of the turn is an automatic trigger, so there's no way for the player to choose which robot to deal damage to here! _(Note that `"deal 3 damage to all robots"` or `"to a random robot"` is totally fine – the issue is with asking for user choice in a triggered ability.)_
* `"Reduce the energy cost of all robots in play by 2"` – While changing the cost of cards-in-hand makes sense, changing the cost of objects _already on the board_ is meaningless – their energy cost doesn't matter because they've already been played!

And more fundamentally, the text on robot/structure cards and action cards is fundamentally different: action cards represent one-time **actions** (like, `"Draw 3 cards"`), while robot and structure cards have **passive abilities** (like `"Adjacent robots have +2 health"`)  or **triggered abilities** (like, `"Whenever this robot moves, draw a card"`) or **activated abilities** (like `"Activate: Draw a card"`).

So, we need some way to enforce rules about what kinds of semantic structures are not allowed, based on the card type.

This is where the [`AstValidator`](https://github.com/wordbots/wordbots-parser/blob/main/src/main/scala/wordbots/AstValidator.scala) comes into play.

Basically, it takes our semantic expression that the parser produced, and examines it as a tree-structure:
![graphviz.png](https://www.dropbox.com/s/tb0cy1nkic9ebiw/graphviz.png?dl=0&raw=1)

Each "validation rule" now traverses the tree and checks for specific disallowed patterns (for example, a `Choose` expression inside a `TriggeredAbility` block, which would violate the _"no player-chosen targeting during trigger activation"_ rule).

If a validation rule fails, this also triggers the `ErrorAnalyzer`! So, if we had, for example tried to make a robot with just the text `"Give all your robots Jump"` (fine for an Action card, but not valid text for a Robot card because it's not an _ability_), we would get this helpful suggestion:

![Screen Shot 2022-07-31 at 9.39.25 PM.png](https://www.dropbox.com/s/czwqmfagrwqogjr/Screen%20Shot%202022-07-31%20at%209.39.25%20PM.png?dl=0&raw=1)

## Step 4. JavaScript Code Generation

Now that our abstract semantic representation has made it safely through the `AstValidator`, it's time to turn it into JavaScript!

This is the work of the [`CodeGenerator`](https://github.com/wordbots/wordbots-parser/blob/main/src/main/scala/wordbots/CodeGenerator.scala), and it's fairly straightforward: just like the `AstValidator`, it treats the semantic representation as an abstract tree, and recurses through the tree, generating scary-looking JavaScript as it goes along.

For example,
```
codeFor(TriggeredAbility(trigger, action)) = "(function () { setTrigger(${codeFor(trigger)}, ${codeFor(action)}); })"
codeFor(AfterPlayed(object)) = "triggers['afterPlayed'](function () { return ${codeFor(targetObj)}; })"
```
and so on and so forth.

We recurse all the way through the tree, and finally our semantic representation `TriggeredAbility(AfterPlayed(ThisObject), GiveAbility(ObjectsMatchingConditions(Robot, List(ControlledBy(Self))), ApplyEffect(ThisObject, CanMoveOverObjects)))` gets transformed into real-life JavaScript code:
```
(function () { setTrigger(triggers['afterPlayed'](function () { return targets['thisRobot'](); }), (function () { actions['giveAbility'](objectsMatchingConditions('robot', [conditions['controlledBy'](targets['self']())]), \"(function () { setAbility(abilities['applyEffect'](function () { return targets['thisRobot'](); }, 'canmoveoverobjects')); })\"); })); })
```

Well, I didn't say it was going to be good-looking JavaScript code.

"Human-readable" is not really a word I'd use to describe it, but maybe we can format it just a bit more nicely:
```
(function () {
    setTrigger(
        triggers['afterPlayed'](
            function () {
                return targets['thisRobot']();
            }),
            (function () {
                actions['giveAbility'](
                    objectsMatchingConditions(
                        'robot',
                        [conditions['controlledBy'](targets['self']())]
                    ),
                    \"(
                        function () {
                            setAbility(
                                abilities['applyEffect'](
                                    function () { return targets['thisRobot'](); },
                                    'canmoveoverobjects'
                                )
                            );
                        })
                    \"
                );
            }
        )
    );
})
```

## Step 5. Execution

This is the point at which the Wordbots "parser" (which is really more of a parser+validator+code generator, as we have seen now) hands back control to the game itself. The mess of JavaScript produced gets stored within the card that we have just created.

So, what happens when we try to play this card in an actual game?

Well, we just run the generated code (via `eval()`, of course), plugging into it the Wordbots [client-side vocabulary](https://github.com/wordbots/wordbots-core/blob/main/src/common/vocabulary/vocabulary.ts) implementation, that defines what things like `setTrigger` and `targets['thisRobot']`, etc, all _actually do_ in the game itself.

Of course, it's a little more complicated than that:
* The actual implementations of all of these things – `actions` and `targets` and `triggers` and so on – end up depending on the object performing the action (if any), and sometimes even depending on how the object got the ability in question (if any).
* Actions and abilities are represented as JavaScript functions, but of course they in turn contain references to _other_ actions and abilities, which have to be represented as functions themselves! _(For example, the "Jump" ability that our robot is bestowing on other robots is itself represented as a function)_ Usually these become represented as stringified functions, but sometimes they are functions returning stringified functions, depending on exactly what order things need to execute in a given context. Sometimes these things can get nested quite a few levels deep, and become completely unreadable as a result.
* The `CodeGenerator` acts as a last-ditch bulwark of sanity by trying to execute the JavaScript code produced (using [Mozilla Rhino](https://github.com/mozilla/rhino)), to make sure it's even valid JavaScript. It does the same thing for every function-inside-a-function it can find inside the code too, executing each in turn to make sure it's valid JavaScript functions all the way down.
* The Wordbots command-execution system is also a little more sophisticated than a simple `eval()` statement – among other things, it keeps track of its own execution stack depth in order to detect infinite loops caused by card behavior. (These typically happens if two triggers manage to trigger one another _ad infinitum_ – it's a rare situation and causes the game to end in a draw.)
* And of course things get even more exciting with Wordbots cards that modify the text of other cards, causing an even more closely-linked cycle between the parser and the execution system. With the introduction of this mechanic, cards can trigger a re-parse of other cards in the middle of execution:
![Screen Shot 2022-07-31 at 10.43.23 PM.png](https://www.dropbox.com/s/00kyjbig903qc1x/Screen%20Shot%202022-07-31%20at%2010.43.23%20PM.png?dl=0&raw=1)

# In Summary ...

![Infographic](https://i.imgur.com/AFbSSQo.png)