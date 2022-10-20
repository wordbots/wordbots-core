import {
  capitalize, compact, debounce, flatMap, fromPairs, has,
  isArray, mapValues, omit, pick, reduce, uniqBy
} from 'lodash';

import * as w from '../types';
import * as g from '../guards';
import {
  CARD_SCHEMA_VERSION,
  HINT_REGEXES, HINTS, KEYWORD_REGEXES,
  KEYWORDS, PARSE_DEBOUNCE_MS, PARSER_URL, SPRITE_VERSION,
  SYNONYMS, TYPE_EVENT, TYPE_ROBOT, CREATABLE_TYPES
} from '../constants';
import defaultState from '../store/defaultCollectionState';
import { CreatorStateProps } from '../containers/Creator';

import { ensureInRange, id as generateId } from './common';
import { indexParsedSentence, lookupCurrentUser } from './firebase';

//
// 1. Miscellaneous helper functions pertaining to cards.
//

/** Instantiate a CardInStore into a CardInGame by setting additional fields. */
export function instantiateCard(card: w.CardInStore): w.CardInGame {
  return {
    ...card,
    id: generateId(),
    baseCost: card.cost
  };
}

/** Obfuscate all cards in an array, optionally leaving one card unobfuscated (e.g. if that card is about to be played).
  * NOTE that card obfuscation functionality is currently known to be broken and is thus disabled. */
export function obfuscateCards(cards: w.Card[], revealCardIdx: number | null = null): w.ObfuscatedCard[] {
  return cards.map((card, idx) =>
    idx === revealCardIdx ? card : { id: 'obfuscated' }
  );
}

/** Given a card that may be obfuscated, assert that it is unobfuscated.
  * NOTE that card obfuscation functionality is currently known to be broken and is thus disabled. */
export function assertCardVisible(card: w.PossiblyObfuscatedCard): w.CardInGame {
  if (g.isCardObfuscated(card)) {
    throw new Error('Expected a visible card but received an obfuscated card!');
  } else {
    return card;
  }
}

/** Replace a player's deck, hand, and/or discard pile.
  * Used in handling REVEAL_CARDS actions.
  * NOTE that card obfuscation functionality is currently known to be broken and is thus disabled. */
export function replaceCardsInPlayerState(
  playerState: w.PlayerInGameState,
  newCards: {
    deck?: w.PossiblyObfuscatedCard[]
    hand?: w.PossiblyObfuscatedCard[]
    discardPile?: w.CardInGame[]
  } = {}
): w.PlayerInGameState {
  return {
    ...playerState,
    deck: newCards.deck || playerState.deck,
    hand: newCards.hand || playerState.hand,
    discardPile: newCards.discardPile || playerState.discardPile
  };
}

/** Generate a `CardSource` corresponding to the current user, if any. */
function cardSourceForCurrentUser(): w.CardSource {
  const user = lookupCurrentUser();
  return {
    type: 'user',
    uid: user ? user.uid : undefined,
    username: user ? user.displayName! : undefined
  };
}

//
// 2. Helper functions for card-related components.
//

/** Converts card from cardCreator store format -> format for collection and game stores. */
export function createCardFromProps(props: w.CreatorState): w.CardInStore {
  const {
    attack, cost, health, flavorText, id, isPrivate, name, parserVersion,
    sentences: rawSentences, speed, spriteID, type
  } = props;
  const sentences = rawSentences.filter((s: { sentence: string }) => /\S/.test(s.sentence));
  const command = sentences.map((s: { result: { js?: string } }) => s.result.js!);

  const card: w.CardInStore = {
    id: id || generateId(),
    name,
    type,
    spriteID,
    spriteV: SPRITE_VERSION,
    parserV: parserVersion,
    text: sentences.map((s: { sentence: string }) => `${s.sentence}. `).join(''),
    flavorText,
    cost,
    metadata: {
      ownerId: cardSourceForCurrentUser().uid!,
      source: cardSourceForCurrentUser(),
      created: Date.now(),
      updated: Date.now(),
      isPrivate: !!isPrivate
    }
  };

  if (type === TYPE_EVENT) {
    card.command = command;
  } else {
    card.abilities = command;
    card.stats = type === TYPE_ROBOT ? { attack, health, speed } : { health };
  }

  return card;
}

export interface CardValidationResults {
  isValid: boolean
  parseErrors: string[]
  nameError: string | null
  costError: string | null
  typeError: string | null
  textError: string | null
  attackError: string | null
  healthError: string | null
  speedError: string | null
}
/** Given `CreatorStateProps`, validate the card being created and produce `CardValidationResults`. */
export function validateCardInCreator(props: CreatorStateProps): CardValidationResults {
  const { name, cost, type, sentences, attack, health, speed } = props;

  const nonEmptySentences: w.Sentence[] = sentences.filter((s) => /\S/.test(s.sentence));
  const hasCardText: boolean = nonEmptySentences.length > 0;

  const parseErrors: string[] = compact(nonEmptySentences.map((s) => s.result.error)).map((error) =>
    (`${error}.`)
      .replace('..', '.')
      .replace('Parser did not produce a valid expression', 'Parser error')
  );

  const nameError: string | null = (!name || name === '[Unnamed]') ? 'This card needs a name!' : null;
  const typeError: string | null = !CREATABLE_TYPES.includes(type) ? 'Invalid type.' : null;
  const costError: string | null = ensureInRange('cost', cost, 0, 20);
  const attackError: string | null = (type === TYPE_ROBOT) ? ensureInRange('attack', attack, 0, 10) : null;
  const healthError: string | null = (type !== TYPE_EVENT) ? ensureInRange('health', health, 1, 10) : null;
  const speedError: string | null = (type === TYPE_ROBOT) ? ensureInRange('speed', speed, 0, 3) : null;

  const textError: string | null = (() => {
    if (type === TYPE_EVENT && !hasCardText) {
      return 'Action cards must have card text.';
    } else if (parseErrors.length > 0) {
      return parseErrors.join(' ');
    } else if (nonEmptySentences.find((s) => !s.result.js)) {
      return 'Sentences are still being parsed ...';
    } else {
      return null;
    }
  })();

  const isValid = !nameError && !typeError && !costError && !attackError && !healthError && !speedError && !textError;

  return { isValid, parseErrors, nameError, typeError, costError, attackError, healthError, speedError, textError };
}

//
// 3. Text parsing.
//

/** Given a sentence, replace all synonyms (see `SYNONYMS`) in that sentence. */
export function replaceSynonyms(text: string): string {
  return reduce(SYNONYMS, ((str, synonyms, term) => {
    synonyms = isArray(synonyms) ? synonyms : [synonyms];
    return str.replace(new RegExp(`(${synonyms.join('|')})`, 'g'), term)
      .replace(new RegExp(`(${synonyms.map(capitalize).join('|')})`, 'g'), capitalize(term));
  }), text);
}

/** Given a string containing potentially many sentences, return an array of sentences. */
export function splitSentences(str?: string): string[] {
  return (str || '').split(/[\\.!?]/).filter((s) => /\S/.test(s));
}

/** Given card text input, return an array of pre-processed
  * (synonym replacement -> splitting -> keyword replacement) sentences. */
export function getSentencesFromInput(text: string): string[] {
  let sentences = splitSentences(replaceSynonyms(text));
  sentences = flatMap(sentences, (s) => isKeywordExpression(s) ? s.replace(/,/g, ',|').split('|') : s);

  return sentences;
}

/** Parse without debounce. Only used by requestParse() and parseCard() below. */
function parse(
  sentences: string[],
  mode: w.ParserMode,
  callback: (idx: number, sentence: string, json: w.ParseResult) => void,
  index = true,
  // fast mode does only the bare minimum error analysis (no syntax/semantics suggestions) to speed up parse results
  fastMode = false
): void {
  sentences.forEach((sentence, idx) => {
    const parserInput = encodeURIComponent(expandKeywords(sentence));
    const parseUrl = `${PARSER_URL}/parse?input=${parserInput}&format=js&mode=${mode}${fastMode ? '&fast=true' : ''}`;

    fetch(parseUrl)
      .then((response) => response.json())
      .then((json) => {
        callback(idx, sentence, json);
        if (index && json.tokens && json.js) {
          indexParsedSentence(sentence, json.tokens, json.js);
        }
      })
      .catch((error) => {
        // TODO better error handling
        console.error(error);
        throw new Error((`Parser error: ${error}`));
      });
  });
}

/** Parse with debounce. */
export const requestParse = debounce(parse, PARSE_DEBOUNCE_MS);

/** Parse a batch of sentences and return a promise for each [sentence, result] pair.
  * TODO Use parseBatch() for all parsing? */
export function parseBatch(
  sentences: string[],
  mode: w.ParserMode
): Promise<Array<{ sentence: string, result: w.ParseResult }>> {
  return fetch(`${PARSER_URL}/parse`, {
    method: 'POST',
    body: JSON.stringify(sentences.map((input) => ({ input, mode }))),
    headers: { 'Content-Type': 'application/json' }
  })
    .then((response) => response.json())
    .then((results) =>
      (results as Array<[string, { SuccessfulParseResponse?: w.ParseResult, FailedParseResponse?: w.ParseResult }]>).map(([sentence, result]) =>
        ({ sentence, result: (result.SuccessfulParseResponse || result.FailedParseResponse!) })
      )
    )
    .catch((error) => {
      // TODO better error handling
      throw new Error((`Parser error: ${error}`));
    });
}

/**
 * Given a card that is complete except for command/abilities,
 * parse the text to fill in command/abilities, then trigger callback.
 * Used only in the following places:
 *   - cardsFromJson()
 *   - rewrite.tsx (i.e. card rewrite effects)
 *   - in integration tests
 */
export function parseCard(
  card: w.CardInStore,
  callback: (c: w.CardInStore, parseResult: string[]) => void,
  errorCallback?: (message: string) => void,
  opts?: {
    // disables indexing successful parse results in Firebase
    disableIndexing?: boolean
    // does only the bare minimum error analysis (no syntax/semantics suggestions) to speed up parse results
    fastMode?: boolean
  }
): void {
  const isEvent = card.type === TYPE_EVENT;
  const sentences = getSentencesFromInput(card.text || '');
  const parseResults: string[] = [];

  parse(
    sentences,
    isEvent ? 'event' : 'object',
    (idx, _, response) => {
      if (response.error) {
        const errorMsg = `Received '${response.error}' while parsing '${sentences[idx]}'`;
        if (errorCallback) {
          errorCallback(errorMsg);
        } else {
          throw new Error(errorMsg);
        }
      }

      parseResults[idx] = response.js!;

      // Are we done parsing?
      if (compact(parseResults).length === sentences.length) {
        card[isEvent ? 'command' : 'abilities'] = parseResults;
        callback(card, parseResults);
      }
    },
    !opts?.disableIndexing,
    opts?.fastMode
  );
}

//
// 3.5. Keyword abilities.
//

/** Given a sentence, return an array of comma-separated phrases. */
function phrases(sentence: string): string[] {
  return sentence.split(',')
    .filter((s) => /\S/.test(s))
    .map((s) => s.trim());
}

/** Combine `KEYWORDS` and `HINTS`, i.e. for displaying them together in the dictionary dialog. */
export function allKeywords(): { [keyword: string]: string } {
  return { ...KEYWORDS, ...HINTS };
}

/** Return whether a sentence is a keyword expression (that is, composed solely of keywords). */
function isKeywordExpression(sentence: string, hintsToo = false): boolean {
  const keywords = hintsToo ? { ...KEYWORDS, ...HINTS } : KEYWORDS;
  return phrases(sentence).every((p) => has(keywords, p.toLowerCase()));
}

/** Given a sentence, return a record of any keywords in the sentence, along with corresponding definitions. */
export function keywordsInSentence(sentence: string, hintsToo = false): { [keyword: string]: string } {
  const keywords = hintsToo ? { ...KEYWORDS, ...HINTS } : KEYWORDS;
  const regexes = hintsToo ? { ...KEYWORD_REGEXES, ...HINT_REGEXES } : KEYWORD_REGEXES;

  if (isKeywordExpression(sentence, hintsToo)) {
    return fromPairs(phrases(sentence).map((p) => [p, keywords[p.toLowerCase()]]));
  } else {
    const keywordsList = compact(Object.keys(keywords).map((keyword) => {
      const match = sentence.match(regexes[keyword]);
      return match ? match[1] : null;
    }));
    return fromPairs(keywordsList.map((k) => [k, keywords[k.toLowerCase()]]));
  }
}

/** Given a sentence, return that sentence with all keyword expressions expanded out, potentially in quotes. */
export function expandKeywords(sentence: string, quote = false): string {
  const keywords = keywordsInSentence(sentence);
  return reduce(keywords, (str, def, keyword) => str.replace(new RegExp(keyword, 'g'), quote ? `"${def}"` : def), sentence);
}

/** Given a sentence, contract all keyword definitions into their correponding keyword terms. */
export function contractKeywords(sentence: string): string {
  const keywords = mapValues(KEYWORDS, (k) => k.split(/(,|\.)/)[0]);
  return reduce(keywords, ((str, def, keyword) =>
    str.replace(`"${def}"`, capitalize(keyword))
      .replace(def, capitalize(keyword))
  ), sentence);
}

/** Given a sentence, return that sentence with all keyword terms in quotes.
  * e.g. 'All robots have Jump' => 'All robots have "Jump"' */
export function quoteKeywords(sentence: string): string {
  return contractKeywords(expandKeywords(sentence, true));
}

//
// 4. Import/export.
//

/** Given an array of `CardInStore`, return a JSON-encoded representation. */
export function cardsToJson(cards: w.CardInStore[]): string {
  const exportedFields = ['name', 'type', 'cost', 'spriteID', 'spriteV', 'text', 'stats', 'metadata'];
  const cardsToExport = cards.map((card) => ({
    ...pick(card, exportedFields),
    schema: CARD_SCHEMA_VERSION
  }));
  return JSON.stringify(cardsToExport).replace(/\\"/g, '%27');
}

/** Given a JSON-encoded card representation of an array of CardsInStore,
  * produce the corresponding cards (using the parser to parse card text),
  * and trigger the corresponding callback for each card parsed this way. */
export function cardsFromJson(json: string, callback: (card: w.CardInStore) => void): void {
  // In the future, we may update the card schema, and this function would have to deal
  // with migrating between schema versions.
  JSON.parse(json.replace(/%27/g, '\\"'))
    .map((card: w.CardInStore) => ({
      ...omit(card, ['schema']),
      id: generateId(),
      metadata: {
        ...card.metadata,
        ownerId: cardSourceForCurrentUser().uid,
        source: (card.metadata?.source) || cardSourceForCurrentUser(),
        created: (card.metadata?.created) || Date.now(),
        updated: Date.now(),
        importedFromJson: Date.now()
      }
    }))
    .forEach((card: w.CardInStore) => { parseCard(card, callback); });
}

/** Given a card (e.g. from Firebase) that may be in an older format, return a valid CardInStore. */
export function normalizeCard(card: w.CardInStore, explicitSource?: w.CardSource): w.CardInStore {
  function normalizeSource(cardSource: any): w.CardSource {
    // Correctly resolve card source for old cards with source == 'user' or source == 'builtin'
    if (cardSource === 'builtin') {
      return { type: 'builtin' };
    } else if (cardSource === 'user') {
      return explicitSource || cardSourceForCurrentUser();
    } else {
      return { ...cardSource, type: 'user' };
    }
  }

  const source: w.CardSource = card.metadata?.source || normalizeSource((card as any).source);
  const metadata: w.CardMetadata = {
    // Build metadata field for older cards without it
    ...card.metadata,
    ownerId: card.metadata?.ownerId || explicitSource?.uid || source.uid,
    source,
    updated: (card.metadata?.updated) || (card as any).timestamp,
    isPrivate: (card.metadata?.isPrivate) || false
  };

  return { ...card, metadata };
}

/** Given CollectionState and raw cards data returned from Firebase, populate state.cards . */
export function loadCardsFromFirebase(state: w.CollectionState, data?: any): w.CollectionState {
  if (data) {
    if (data.cards) {
      const cardsFromFirebase = data.cards.map((card: any) => normalizeCard(card)) || [];
      state.cards = uniqBy(state.cards.concat(cardsFromFirebase), 'id');
    }
  } else {
    state.cards = defaultState.cards;
  }

  return state;
}

/** Given CollectionState and raw decks data returned from Firebase, populate state.decks . */
export function loadDecksFromFirebase(state: w.CollectionState, data: any): w.CollectionState {
  return {
    ...state,
    decks: data ? ((data.decks as w.DeckInStore[]) || state.decks) : defaultState.decks
  };
}

/** Given CollectionState and raw decks data returned from Firebase, populate state.sets . */
export function loadSetsFromFirebase(state: w.CollectionState, data: any): w.CollectionState {
  const normalizeCards = (set: w.Set): w.Set => ({
    ...set,
    cards: set.cards.map((card) =>
      normalizeCard(card, { type: 'user', uid: set.metadata.authorId, username: set.metadata.authorName })
    )
  });

  return {
    ...state,
    sets: data ? (data.sets ? (data.sets as w.Set[]).map(normalizeCards) : state.sets) : defaultState.sets
  };
}

/** Yield the parser lexicon (i.e. dictionary of term definitions) from the parser. */
export function loadParserLexicon(): Promise<{ [token: string]: any }> {
  return fetch(`${PARSER_URL}/lexicon?format=json`)
    .then((response) => response.json())
    .catch((error) => {
      // TODO better error handling
      throw new Error((`Error retrieving lexicon: ${error}`));
    });
}
