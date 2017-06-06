import editDistance from 'minimum-edit-distance';
import {
  capitalize, compact, countBy, debounce, flatMap, fromPairs,
  isArray, mapValues, omit, pick, reduce, uniqBy, words
} from 'lodash';

import { PARSER_URL, TYPE_ROBOT, TYPE_EVENT, TYPE_STRUCTURE, typeToString } from '../constants';
import defaultState from '../store/defaultCollectionState';

import { id as generateId, compareCertainKeys } from './common';
import { saveUserData, indexParsedSentence } from './firebase';

//
// 0. Card-related constants (used below).
//

const CARD_SCHEMA_VERSION = 1;
const PARSE_DEBOUNCE_MS = 500;

const SYNONYMS = {
  ' 0 ': ' zero ',
  ' 1 ': ' one ',
  ' 2 ': ' two ',
  ' 3 ': ' three ',
  ' 4 ': ' four ',
  ' 5 ': ' five ',
  ' 6 ': ' six ',
  ' 7 ': ' seven ',
  ' 8 ': ' eight ',
  ' 9 ': ' nine ',
  ' 10 ': ' ten ',

  'robot': ['creature', 'minion'],
  'startup': ['start up', 'start-up'],
  'shutdown': ['shut down', 'shut-down']
};

const KEYWORDS = {
  'defender': 'This robot can\'t attack.',
  'haste': 'This robot can move and attack immediately after it is played.',
  'jump': 'This robot can move over other objects.',
  'taunt': 'Your opponent\'s adjacent robots can only attack this object.',
  'startup:': 'When this object is played,',
  'shutdown:': 'When this object is destroyed,'
};

const HINTS = {
  'activate:': 'Objects can Activate once per turn. (Robots can\'t activate and attack in the same turn)'
};

function objToRegexes(obj) {
  return fromPairs(Object.keys(obj).map(k => [k, new RegExp(`(${k}|${capitalize(k)})`)]));
}
const KEYWORD_REGEXES = objToRegexes(KEYWORDS);
const HINT_REGEXES = objToRegexes(HINTS);

//
// 1. Miscellaneous helper functions pertaining to cards.
//

export function areIdenticalCards(card1, card2) {
  // TODO: Check abilities/command rather than text.
  return compareCertainKeys(card1, card2, ['type', 'cost', 'text', 'stats']);
}

export function cardsInDeck(deck, cards) {
  return compact((deck.cardIds || []).map(id => cards.find(c => c.id === id)));
}

export function instantiateCard(card) {
  return Object.assign({}, card, {
    id: generateId(),
    baseCost: card.cost
  });
}

export function findSimilarText(sentence, corpus) {
  const wordsInSentence = words(sentence);
  return corpus.filter(text =>
    (text.startsWith(wordsInSentence[0]) || text.endsWith(wordsInSentence.slice(-1))) &&
      editDistance.diff(words(text), wordsInSentence).distance === 1
  );
}

//
// 2. Helper functions for card-related components.
//

export function groupCards(cards) {
  return uniqBy(cards, 'id').map(card =>
    Object.assign({}, card, {count: countBy(cards, 'name')[card.name]})
  );
}

export function getDisplayedCards(cards, opts = {}) {
  return cards
    .filter(card => isCardVisible(card, opts.filters, opts.costRange) && searchCards(card, opts.searchText))
    .sort((c1, c2) => sortCards(c1, c2, opts.sortCriteria, opts.sortOrder));
}

export function isCardVisible(card, filters = {}, costRange = [0, 0]) {
  if ((!filters.robots && card.type === TYPE_ROBOT) ||
      (!filters.events && card.type === TYPE_EVENT) ||
      (!filters.structures && card.type === TYPE_STRUCTURE) ||
      (card.cost < costRange[0] || card.cost > costRange[1])) {
    return false;
  } else {
    return true;
  }
}

function searchCards(card, query = '') {
  query = query.toLowerCase();
  return card.name.toLowerCase().includes(query) || (card.text || '').toLowerCase().includes(query);
}

function sortCards(c1, c2, criteria, order) {
  // Individual sort columns that are composed into sort functions below.
  // (Note: We convert numbers to base-36 to preserve sorting. eg. "10" < "9" but "a" > "9".)
  const [cost, name, type, source, attack, health, speed] = [
    c => c.cost.toString(36),
    c => c.name.toLowerCase(),
    c => typeToString(c.type),
    c => c.source === 'builtin',
    c => (c.stats && c.stats.attack || 0).toString(36),
    c => (c.stats && c.stats.health || 0).toString(36),
    c => (c.stats && c.stats.speed || 0).toString(36)
  ];

  // Sorting functions for card collections:
  // 0 = cost, 1 = name, 2 = type, 3 = source, 4 = attack, 5 = health, 6 = speed.
  const f = [
    c => [cost(c), name(c)],
    c => [name(c), cost(c)],
    c => [type(c), cost(c), name(c)],
    c => [source(c), cost(c), name(c)],
    c => [attack(c), cost(c), name(c)],
    c => [health(c), cost(c), name(c)],
    c => [speed(c), cost(c), name(c)]
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

export function replaceSynonyms(text) {
  return reduce(SYNONYMS, ((str, synonyms, term) => {
    synonyms = isArray(synonyms) ? synonyms : [synonyms];
    return str.replace(new RegExp(`(${synonyms.join('|')})`, 'g'), term)
              .replace(new RegExp(`(${synonyms.map(capitalize).join('|')})`, 'g'), capitalize(term));
  }), text);
}

export function splitSentences(str) {
  return (str || '').split(/[\\.!\?]/).filter(s => /\S/.test(s));
}

export function getSentencesFromInput(text) {
  let sentences = splitSentences(replaceSynonyms(text));
  sentences = flatMap(sentences, s => isKeywordExpression(s) ? s.replace(/,/g, ',|').split('|') : s);

  return sentences;
}

function parse(sentences, mode, callback) {
  sentences.forEach((sentence, idx) => {
    const parserInput = encodeURIComponent(expandKeywords(sentence));
    const parseUrl = `${PARSER_URL}/parse?input=${parserInput}&format=js&mode=${mode}`;

    fetch(parseUrl)
      .then(response => response.json())
      .then(json => {
        callback(idx, sentence, json);
        if (json.tokens && json.js) {
          indexParsedSentence(sentence, json.tokens, json.js);
        }
      })
      .catch(err => {
        // TODO better error handling
        throw(`Parser error: ${err}`);
      });
  });
}

export const requestParse = debounce(parse, PARSE_DEBOUNCE_MS);

// Given a card that is complete except for command/abilities,
// parse the text to fill in command/abilities, then trigger callback.
function parseCard(card, callback) {
  const isEvent = card.type === TYPE_EVENT;
  const sentences = getSentencesFromInput(card.text);
  const parseResults = [];

  parse(sentences, isEvent ? 'event' : 'object', (idx, _, response) => {
    parseResults[idx] = response.js;

    // Are we done parsing?
    if (compact(parseResults).length === sentences.length) {
      card[isEvent ? 'command' : 'abilities'] = parseResults;
      callback(card);
    }
  });
}

// How many targets are there in each logical unit of the parsed JS?
export function numTargetsPerLogicalUnit(parsedJS) {
  // Activated abilities separate logical units:
  //     BAD <- "Deal 2 damage. Destroy a structure."
  //    GOOD <- "Activate: Deal 2 damage. Activate: Destroy a structure."
  const units = compact(parsedJS.split('abilities[\'activated\']'));
  return units.map(unit => (unit.match(/choose/g) || []).length);
}

//
// 3.5. Keyword abilities.
//

function phrases(sentence) {
  return sentence.split(',')
                 .filter(s => /\S/.test(s))
                 .map(s => s.trim());
}

export function allKeywords() {
  return Object.assign({}, KEYWORDS, HINTS);
}

export function isKeywordExpression(sentence, hintsToo = false) {
  return phrases(sentence).every(p => KEYWORDS[p.toLowerCase()]);
}

export function keywordsInSentence(sentence, hintsToo = false) {
  const keywords = hintsToo ? Object.assign({}, KEYWORDS, HINTS) : KEYWORDS;
  const regexes = hintsToo ? Object.assign({}, KEYWORD_REGEXES, HINT_REGEXES) : KEYWORD_REGEXES;

  if (isKeywordExpression(sentence)) {
    return fromPairs(phrases(sentence).map(p => [p, keywords[p.toLowerCase()]]));
  } else {
    const keywordsList = compact(Object.keys(keywords).map(keyword => {
      const match = sentence.match(regexes[keyword]);
      return match ? match[1] : null;
    }));
    return fromPairs(keywordsList.map(k => [k, keywords[k.toLowerCase()]]));
  }
}

export function expandKeywords(sentence) {
  const keywords = keywordsInSentence(sentence);
  return reduce(keywords, (str, def, keyword) => str.replace(keyword, def), sentence);
}

export function contractKeywords(sentence) {
  const keywords = mapValues(KEYWORDS, k => k.split(/(\,|\.)/)[0]);
  return reduce(keywords, ((str, def, keyword) =>
    str.replace(`"${def}"`, capitalize(keyword))
       .replace(def, capitalize(keyword))
  ), sentence);
}

//
// 3. Import/export.
//

export function cardsToJson(cards) {
  const exportedFields = ['name', 'type', 'cost', 'spriteID', 'text', 'stats'];
  const cardsToExport = cards.map(card =>
    Object.assign({}, pick(card, exportedFields), {schema: CARD_SCHEMA_VERSION})
  );
  return JSON.stringify(cardsToExport).replace(/\\"/g, '%27');
}

export function cardsFromJson(json, callback) {
  // In the future, we may update the card schema, and this function would have to deal
  // with migrating between schema versions.
  JSON.parse(json.replace(/%27/g, '\\"'))
    .map(card =>
      Object.assign({}, omit(card, ['schema']), {
        id: generateId(),
        source: 'user',
        timestamp: Date.now()
      })
    )
    .forEach(card => { parseCard(card, callback); });
}

export function loadCardsFromFirebase(state, data) {
  if (data) {
    if (data.cards) {
      state.cards = uniqBy(state.cards.concat(data.cards || []), 'id');
    }
  } else {
    state.cards = defaultState.cards;
  }

  return state;
}

export function loadDecksFromFirebase(state, data) {
  if (data) {
    if (data.decks) {
      state.decks = data.decks;
    }
  } else {
    state.decks = defaultState.decks;
  }

  return state;
}

export function saveCardsToFirebase(state) {
  saveUserData('cards', state.cards.filter(c => c.source !== 'builtin'));
}

export function saveDecksToFirebase(state) {
  saveUserData('decks', state.decks);
}

export function loadParserLexicon(callback) {
  fetch(`${PARSER_URL}/lexicon?format=json`)
    .then(response => response.json())
    .then(callback)
    .catch(err => {
      // TODO better error handling
      throw(`Error retrieving lexicon: ${err}`);
    });
}
