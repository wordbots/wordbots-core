import {
  capitalize, compact, countBy, debounce, flatMap, fromPairs, has,
  isArray, mapValues, omit, pick, reduce, shuffle, uniqBy
} from 'lodash';

import * as w from '../types';
import * as g from '../guards';
import {
  CARD_SCHEMA_VERSION,
  HINT_REGEXES, HINTS, KEEP_DECKS_UNSHUFFLED, KEYWORD_REGEXES,
  KEYWORDS, PARSE_DEBOUNCE_MS, PARSER_URL, SPRITE_VERSION,
  SYNONYMS, TYPE_EVENT, TYPE_ROBOT, TYPE_STRUCTURE, typeToString, CREATABLE_TYPES
} from '../constants';
import defaultState from '../store/defaultCollectionState';
import { CreatorStateProps } from '../containers/Creator';

import { ensureInRange, id as generateId } from './common';
import { indexParsedSentence, lookupCurrentUser } from './firebase';

//
// 1. Miscellaneous helper functions pertaining to cards.
//

export function cardsInDeck(deck: w.DeckInStore, userCards: w.CardInStore[], sets: w.Set[]): w.CardInStore[] {
  const set: w.Set | null = deck.setId && sets.find((s) => s.id === deck.setId) || null;
  const cardPool = set ? set.cards : userCards;
  return compact((deck.cardIds || []).map((id) => cardPool.find((c) => c.id === id)));
}

export function shuffleCardsInDeck(deck: w.DeckInStore, userCards: w.CardInStore[], sets: w.Set[]): w.CardInGame[] {
  const unshuffledCards = cardsInDeck(deck, userCards, sets);
  const potentiallyShuffledCards = KEEP_DECKS_UNSHUFFLED ? unshuffledCards : shuffle(unshuffledCards);
  return potentiallyShuffledCards.map(instantiateCard);
}

// "Unpacks" a deck so that it can be used in a game.
// { cardIds } => { cardIds, cards }
export function unpackDeck(deck: w.DeckInStore, userCards: w.CardInStore[], sets: w.Set[]): w.DeckInGame {
  return { ...deck, cards: shuffleCardsInDeck(deck, userCards, sets) };
}

export function instantiateCard(card: w.CardInStore): w.CardInGame {
  return {
    ...card,
    id: generateId(),
    baseCost: card.cost
  };
}

// Obfuscate all cards in an array, optionally leaving one card unobfuscated (e.g. if that card is about to be played).
export function obfuscateCards(cards: w.Card[], revealCardIdx: number | null = null): w.ObfuscatedCard[] {
  return cards.map((card, idx) =>
    idx === revealCardIdx ? card : {id: 'obfuscated'}
  );
}

// Given a card that may be obfuscated, assert that it is unobfuscated.
export function assertCardVisible(card: w.PossiblyObfuscatedCard): w.CardInGame {
  if (g.isCardObfuscated(card)) {
    throw new Error('Expected a visible card but received an obfuscated card!');
  } else {
    return card;
  }
}

// Replace a player's deck, hand, and/or discard pile.
// Used in handling REVEAL_CARDS actions.
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

export function groupCards(cards: w.CardInStore[]): Array<w.CardInStore & { count: number }> {
  return uniqBy(cards, 'id').map((card) =>
    ({...card, count: countBy(cards, 'name')[card.name]})
  );
}

export function selectType(cards: w.CardInStore[], type: w.CardType): w.CardInStore[] {
  return cards.filter((card) => card.type === type);
}

export function getDisplayedCards(cards: w.CardInStore[], opts: any = {}): w.CardInStore[] {
  return cards
    .filter((card) => isCardVisible(card, opts.filters, opts.costRange) && searchCards(card, opts.searchText))
    .sort((c1, c2) => sortCards(c1, c2, opts.sortCriteria, opts.sortOrder));
}

export function isCardVisible(card: w.CardInStore, filters: any = {}, costRange = [0, 0]): boolean {
  if ((!filters.robots && card.type === TYPE_ROBOT) ||
      (!filters.events && card.type === TYPE_EVENT) ||
      (!filters.structures && card.type === TYPE_STRUCTURE) ||
      (card.cost < costRange[0] || card.cost > costRange[1])) {
    return false;
  } else {
    return true;
  }
}

// Converts card from cardCreator store format -> format for collection and game stores.
export function createCardFromProps(props: w.CreatorState): w.CardInStore {
  const {
    attack, cost, health, id, isPrivate, name, parserVersion,
    sentences: rawSentences, speed, spriteID, type
  } = props;
  const sentences = rawSentences.filter((s: { sentence: string }) => /\S/.test(s.sentence));
  const command = sentences.map((s: { result: { js?: string }}) => s.result.js!);

  const card: w.CardInStore = {
    id: id || generateId(),
    name,
    type,
    spriteID,
    spriteV: SPRITE_VERSION,
    parserV: parserVersion,
    text: sentences.map((s: { sentence: string }) => `${s.sentence}. `).join(''),
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

function searchCards(card: w.CardInStore, query = ''): boolean {
  query = query.toLowerCase();
  return card.name.toLowerCase().includes(query) || (card.text || '').toLowerCase().includes(query);
}

export function sortCards(c1: w.CardInStore, c2: w.CardInStore, criteria: 0 | 1 | 2 | 3 | 4 | 5 | 6, order: 0 | 1 = 0): 1 | 0 | -1 {
  // Individual sort columns that are composed into sort functions below.
  // (Note: We convert numbers to base-36 to preserve sorting. eg. "10" < "9" but "a" > "9".)
  const [timestamp, cost, name, type, attack, health, speed] = [
    // we want timestamp to be sorted backwards compared to other fields.
    // also, created cards without a timestamp should still come before builtin cards.
    (c: w.CardInStore) => (9999999999999 - (c.metadata.updated || (c.metadata.source.type === 'builtin' ? 0 : 1))).toString(36),
    (c: w.CardInStore) => c.cost.toString(36),
    (c: w.CardInStore) => c.name.toLowerCase(),
    (c: w.CardInStore) => typeToString(c.type),
    (c: w.CardInStore) => (c.stats?.attack || 0).toString(36),
    (c: w.CardInStore) => (c.stats?.health || 0).toString(36),
    (c: w.CardInStore) => (c.stats?.speed || 0).toString(36)
  ];

  // Sorting functions for card collections:
  // 0 = timestamp, 1 = cost, 2 = name, 3 = type, 4 = attack, 5 = health, 6 = speed.
  const f = [
    (c: w.CardInStore) => [timestamp(c), cost(c), name(c)],
    (c: w.CardInStore) => [cost(c), name(c)],
    (c: w.CardInStore) => [name(c), cost(c)],
    (c: w.CardInStore) => [type(c), cost(c), name(c)],
    (c: w.CardInStore) => [attack(c), cost(c), name(c)],
    (c: w.CardInStore) => [health(c), cost(c), name(c)],
    (c: w.CardInStore) => [speed(c), cost(c), name(c)]
  ][criteria];

  if (f(c1) < f(c2)) {
    return order ? 1 : -1;
  } else if (f(c1) > f(c2)) {
    return order ? -1 : 1;
  } else {
    return 0;
  }
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

export function replaceSynonyms(text: string): string {
  return reduce(SYNONYMS, ((str, synonyms, term) => {
    synonyms = isArray(synonyms) ? synonyms : [synonyms];
    return str.replace(new RegExp(`(${synonyms.join('|')})`, 'g'), term)
              .replace(new RegExp(`(${synonyms.map(capitalize).join('|')})`, 'g'), capitalize(term));
  }), text);
}

export function splitSentences(str: string | undefined): string[] {
  return (str || '').split(/[\\.!?]/).filter((s) => /\S/.test(s));
}

export function getSentencesFromInput(text: string): string[] {
  let sentences = splitSentences(replaceSynonyms(text));
  sentences = flatMap(sentences, (s) => isKeywordExpression(s) ? s.replace(/,/g, ',|').split('|') : s);

  return sentences;
}

// Parse without debounce. Only used by requestParse() and parseCard() below.
function parse(
  sentences: string[],
  mode: w.ParserMode,
  callback: (idx: number, sentence: string, json: w.ParseResult) => any,
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

export const requestParse = debounce(parse, PARSE_DEBOUNCE_MS);

// Parse a batch of sentences and return a promise for each [sentence, result] pair.
// TODO Use parseBatch() for all parsing?
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

function phrases(sentence: string): string[] {
  return sentence.split(',')
                 .filter((s) => /\S/.test(s))
                 .map((s) => s.trim());
}

export function allKeywords(): { [keyword: string]: string } {
  return {...KEYWORDS, ...HINTS};
}

function isKeywordExpression(sentence: string, hintsToo = false): boolean {
  const keywords = hintsToo ? {...KEYWORDS, ...HINTS} : KEYWORDS;
  return phrases(sentence).every((p) => has(keywords, p.toLowerCase()));
}

export function keywordsInSentence(sentence: string, hintsToo = false): { [keyword: string]: string } {
  const keywords = hintsToo ? {...KEYWORDS, ...HINTS} : KEYWORDS;
  const regexes = hintsToo ? {...KEYWORD_REGEXES, ...HINT_REGEXES} : KEYWORD_REGEXES;

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

export function expandKeywords(sentence: string, quote = false): string {
  const keywords = keywordsInSentence(sentence);
  return reduce(keywords, (str, def, keyword) => str.replace(new RegExp(keyword, 'g'), quote ? `"${def}"` : def), sentence);
}

export function contractKeywords(sentence: string): string {
  const keywords = mapValues(KEYWORDS, (k) => k.split(/(,|\.)/)[0]);
  return reduce(keywords, ((str, def, keyword) =>
    str.replace(`"${def}"`, capitalize(keyword))
       .replace(def, capitalize(keyword))
  ), sentence);
}

// e.g. 'All robots have Jump' => 'All robots have "Jump"';
export function quoteKeywords(sentence: string): string {
  return contractKeywords(expandKeywords(sentence, true));
}

//
// 4. Import/export.
//

export function cardsToJson(cards: w.CardInStore[]): string {
  const exportedFields = ['name', 'type', 'cost', 'spriteID', 'spriteV', 'text', 'stats', 'metadata'];
  const cardsToExport = cards.map((card) => ({
    ...pick(card, exportedFields),
    schema: CARD_SCHEMA_VERSION
  }));
  return JSON.stringify(cardsToExport).replace(/\\"/g, '%27');
}

export function cardsFromJson(json: string, callback: (card: w.CardInStore) => any): void {
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

export function loadDecksFromFirebase(state: w.CollectionState, data: any): w.CollectionState {
  return {
    ...state,
    decks: data ? ((data.decks as w.DeckInStore[]) || state.decks) : defaultState.decks
  };
}

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

export function loadParserLexicon(): Promise<{ [token: string]: any }> {
  return fetch(`${PARSER_URL}/lexicon?format=json`)
    .then((response) => response.json())
    .catch((error) => {
      // TODO better error handling
      throw new Error((`Error retrieving lexicon: ${error}`));
    });
}
