import {
  capitalize, compact, countBy, debounce, flatMap, fromPairs,
  isArray, mapValues, omit, pick, reduce, shuffle, uniqBy
} from 'lodash';

import * as w from '../types';
import {
  KEEP_DECKS_UNSHUFFLED,
  CARD_SCHEMA_VERSION, SPRITE_VERSION, PARSER_URL, PARSE_DEBOUNCE_MS,
  TYPE_ROBOT, TYPE_EVENT, TYPE_STRUCTURE, typeToString,
  SYNONYMS, KEYWORDS, HINTS, KEYWORD_REGEXES, HINT_REGEXES
} from '../constants';
import defaultState from '../store/defaultCollectionState';

import { id as generateId, compareCertainKeys } from './common';
import { saveUserData, saveRecentCard, indexParsedSentence } from './firebase';

//
// 1. Miscellaneous helper functions pertaining to cards.
//

export function areIdenticalCards(card1: w.Card, card2: w.Card): boolean {
  // TODO: Check abilities/command rather than text.
  return compareCertainKeys(card1, card2, ['type', 'cost', 'text', 'stats']);
}

export function cardsInDeck(deck: w.DeckInStore, cards: w.CardInStore[]): w.CardInStore[] {
  return compact((deck.cardIds || []).map((id) => cards.find((c) => c.id === id)));
}

export function shuffleCardsInDeck(deck: w.DeckInStore, cards: w.CardInStore[]): w.Card[] {
  const unshuffledCards = cardsInDeck(deck, cards);
  return (KEEP_DECKS_UNSHUFFLED ? unshuffledCards : shuffle(unshuffledCards)).map(instantiateCard);
}

// "Unpacks" a deck so that it can be used in a game.
// { cardIds } => { cardIds, cards }
export function unpackDeck(deck: w.DeckInStore, cards: w.CardInStore[]): w.Deck {
  return { ...deck, cards: shuffleCardsInDeck(deck, cards) };
}

export function instantiateCard(card: w.CardInStore): w.Card {
  return Object.assign({}, card, {
    id: generateId(),
    baseCost: card.cost
  });
}

//
// 2. Helper functions for card-related components.
//

export function groupCards(cards: w.Card[]): Array<w.Card & { count: number }> {
  return uniqBy(cards, 'id').map((card) =>
    Object.assign({}, card, {count: countBy(cards, 'name')[card.name]})
  );
}

export function selectType(cards: w.Card[], type: w.CardType): w.Card[] {
  return cards.filter((card) => card.type === type);
}

export function getDisplayedCards(cards: w.Card[], opts: any = {}): w.Card[] {
  return cards
    .filter((card) => isCardVisible(card, opts.filters, opts.costRange) && searchCards(card, opts.searchText))
    .sort((c1, c2) => sortCards(c1, c2, opts.sortCriteria, opts.sortOrder));
}

export function isCardVisible(card: w.Card, filters: any = {}, costRange = [0, 0]): boolean {
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
    attack, cost, health, id, name, parserVersion,
    sentences: rawSentences, speed, spriteID, type
  } = props;
  const sentences = rawSentences.filter((s: { sentence: string }) => /\S/.test(s.sentence));
  const command = sentences.map((s: { result: { js: string }}) => s.result.js);

  const card: w.Card = {
    id: id || generateId(),
    name,
    type,
    spriteID,
    spriteV: SPRITE_VERSION,
    parserV: parserVersion,
    text: sentences.map((s: { sentence: string }) => `${s.sentence}. `).join(''),
    cost,
    source: 'user',  // In the future, this will specify *which* user created the card.
    timestamp: Date.now()
  };

  if (type === TYPE_EVENT) {
    card.command = command;
  } else {
    card.abilities = command;
    card.stats = type === TYPE_ROBOT ? { attack, health, speed } : { health };
  }

  return card;
}

function searchCards(card: w.Card, query = ''): boolean {
  query = query.toLowerCase();
  return card.name.toLowerCase().includes(query) || (card.text || '').toLowerCase().includes(query);
}

function sortCards(c1: w.Card, c2: w.Card, criteria: 0 | 1 | 2 | 3 | 4 | 5 | 6, order: 1 | -1): 1 | 0 | -1 {
  // Individual sort columns that are composed into sort functions below.
  // (Note: We convert numbers to base-36 to preserve sorting. eg. "10" < "9" but "a" > "9".)
  const [cost, name, type, source, attack, health, speed] = [
    (c: w.Card) => c.cost.toString(36),
    (c: w.Card) => c.name.toLowerCase(),
    (c: w.Card) => typeToString(c.type),
    (c: w.Card) => c.source === 'builtin',
    (c: w.Card) => (c.stats && c.stats.attack || 0).toString(36),
    (c: w.Card) => (c.stats && c.stats.health || 0).toString(36),
    (c: w.Card) => (c.stats && c.stats.speed || 0).toString(36)
  ];

  // Sorting functions for card collections:
  // 0 = cost, 1 = name, 2 = type, 3 = source, 4 = attack, 5 = health, 6 = speed.
  const f = [
    (c: w.Card) => [cost(c), name(c)],
    (c: w.Card) => [name(c), cost(c)],
    (c: w.Card) => [type(c), cost(c), name(c)],
    (c: w.Card) => [source(c), cost(c), name(c)],
    (c: w.Card) => [attack(c), cost(c), name(c)],
    (c: w.Card) => [health(c), cost(c), name(c)],
    (c: w.Card) => [speed(c), cost(c), name(c)]
  ][criteria];

  if (f(c1) < f(c2)) {
    return order ? 1 : -1;
  } else if (f(c1) > f(c2)) {
    return order ? -1 : 1;
  } else {
    return 0;
  }
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

export function splitSentences(str: string): string[] {
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
  index = true
): void {
  sentences.forEach((sentence, idx) => {
    const parserInput = encodeURIComponent(expandKeywords(sentence));
    const parseUrl = `${PARSER_URL}/parse?input=${parserInput}&format=js&mode=${mode}`;

    fetch(parseUrl)
      .then((response) => response.json())
      .then((json) => {
        callback(idx, sentence, json);
        if (index && json.tokens && json.js) {
          indexParsedSentence(sentence, json.tokens, json.js);
        }
      })
      .catch((err) => {
        // TODO better error handling
        throw new Error((`Parser error: ${err}`));
      });
  });
}

export const requestParse = debounce(parse, PARSE_DEBOUNCE_MS);

// Parse a batch of sentences and call callback on each [sentence, result] pair.
// TODO Use parseBatch() for all parsing?
export function parseBatch(
  sentences: string[],
  mode: w.ParserMode,
  callback: (sentence: string, result: w.ParseResult) => any
): void {
  fetch(`${PARSER_URL}/parse`, {
    method: 'POST',
    body: JSON.stringify(sentences.map((input) => ({ input, mode }))),
    headers: { 'Content-Type': 'application/json' }
  })
    .then((response) => response.json())
    .then((results) => {
      Object.entries(results).forEach(([sentence, result]) => {
        callback(sentence, result);
      });
    })
    .catch((err) => {
      // TODO better error handling
      throw new Error((`Parser error: ${err}`));
    });
}

// Given a card that is complete except for command/abilities,
// parse the text to fill in command/abilities, then trigger callback.
function parseCard(card: w.Card, callback: (card: w.Card) => any): void {
  const isEvent = card.type === TYPE_EVENT;
  const sentences = getSentencesFromInput(card.text || '');
  const parseResults: string[] = [];

  parse(sentences, isEvent ? 'event' : 'object', (idx, _, response) => {
    parseResults[idx] = response.js;

    // Are we done parsing?
    if (compact(parseResults).length === sentences.length) {
      card[isEvent ? 'command' : 'abilities'] = parseResults;
      callback(card);
    }
  });
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
  return Object.assign({}, KEYWORDS, HINTS);
}

export function isKeywordExpression(sentence: string, hintsToo = false): boolean {
  return phrases(sentence).every((p) => KEYWORDS[p.toLowerCase()]);
}

export function keywordsInSentence(sentence: string, hintsToo = false): { [keyword: string]: string } {
  const keywords = hintsToo ? Object.assign({}, KEYWORDS, HINTS) : KEYWORDS;
  const regexes = hintsToo ? Object.assign({}, KEYWORD_REGEXES, HINT_REGEXES) : KEYWORD_REGEXES;

  if (isKeywordExpression(sentence)) {
    return fromPairs(phrases(sentence).map((p) => [p, keywords[p.toLowerCase()]]));
  } else {
    const keywordsList = compact(Object.keys(keywords).map((keyword) => {
      const match = sentence.match(regexes[keyword]);
      return match ? match[1] : null;
    }));
    return fromPairs(keywordsList.map((k) => [k, keywords[k.toLowerCase()]]));
  }
}

export function expandKeywords(sentence: string): string {
  const keywords = keywordsInSentence(sentence);
  return reduce(keywords, (str, def, keyword) => str.replace(keyword, def), sentence);
}

export function contractKeywords(sentence: string): string {
  const keywords = mapValues(KEYWORDS, (k) => k.split(/(,|\.)/)[0]);
  return reduce(keywords, ((str, def, keyword) =>
    str.replace(`"${def}"`, capitalize(keyword))
       .replace(def, capitalize(keyword))
  ), sentence);
}

//
// 4. Import/export.
//

export function cardsToJson(cards: w.Card[]): string {
  const exportedFields = ['name', 'type', 'cost', 'spriteID', 'spriteV', 'text', 'stats'];
  const cardsToExport = cards.map((card) =>
    Object.assign({}, pick(card, exportedFields), {schema: CARD_SCHEMA_VERSION})
  );
  return JSON.stringify(cardsToExport).replace(/\\"/g, '%27');
}

export function cardsFromJson(json: string, callback: (card: w.Card) => any): void {
  // In the future, we may update the card schema, and this function would have to deal
  // with migrating between schema versions.
  JSON.parse(json.replace(/%27/g, '\\"'))
    .map((card: w.Card) =>
      Object.assign({}, omit(card, ['schema']), {
        id: generateId(),
        source: 'user',
        timestamp: Date.now()
      })
    )
    .forEach((card: w.Card) => { parseCard(card, callback); });
}

export function loadCardsFromFirebase(state: w.CollectionState, data: any): w.CollectionState {
  if (data) {
    if (data.cards) {
      state.cards = uniqBy(state.cards.concat(data.cards || []), 'id');
    }
  } else {
    state.cards = defaultState.cards;
  }

  return state;
}

export function loadDecksFromFirebase(state: w.CollectionState, data: any): w.CollectionState {
  if (data) {
    if (data.decks) {
      state.decks = data.decks;
    }
  } else {
    state.decks = defaultState.decks;
  }

  return state;
}

export function saveCardToFirebase(card: w.CardInStore): void {
  saveRecentCard(card);
}

export function saveCardsToFirebase(state: w.CollectionState): void {
  saveUserData('cards', state.cards.filter((c) => c.source !== 'builtin'));
}

export function saveDecksToFirebase(state: w.CollectionState): void {
  saveUserData('decks', state.decks);
}

export function loadParserLexicon(callback: () => any): void {
  fetch(`${PARSER_URL}/lexicon?format=json`)
    .then((response) => response.json())
    .then(callback)
    .catch((err) => {
      // TODO better error handling
      throw new Error((`Error retrieving lexicon: ${err}`));
    });
}
