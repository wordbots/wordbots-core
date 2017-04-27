import { capitalize, compact, countBy, debounce, every, flatMap, fromPairs, reduce, uniqBy } from 'lodash';

import { TYPE_ROBOT, TYPE_EVENT, TYPE_STRUCTURE, typeToString } from '../constants';
import defaultState from '../store/defaultCollectionState';

import { compareCertainKeys } from './common';
import { saveUserData, indexParsedSentence } from './firebase';

//
// 0. Card-related constants (used below).
//

const CARD_SCHEMA_VERSION = 1;
const PARSER_URL = 'http://parser.wordbots.io/parse';  // 'http://localhost:8080/parse';
const PARSE_DEBOUNCE_MS = 500;

const SYNONYMS = {
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

//
// 1. Miscellaneous helper functions pertaining to cards.
//

export function areIdenticalCards(card1, card2) {
  // TODO: Once we have better UX for this, it's time to start getting stricter
  // (no longer care about the name, and check abilities/command rather than text).
  return compareCertainKeys(card1, card2, ['name', 'type', 'cost', 'text', 'stats']);
}

//
// 2. Helper functions for card-related components.
//

export function cardsInDeck(deck, cards) {
  return compact(deck.cardIds.map(id => cards.find(c => c.id === id)));
}

export function groupCards(cards) {
  return uniqBy(cards, 'id').map(card =>
    Object.assign({}, card, {count: countBy(cards, c => c.name)[card.name]})
  );
}

export function isCardVisible(card, filters, costRange) {
  if ((!filters.robots && card.type === TYPE_ROBOT) ||
      (!filters.events && card.type === TYPE_EVENT) ||
      (!filters.structures && card.type === TYPE_STRUCTURE) ||
      (card.cost < costRange[0] || card.cost > costRange[1])) {
    return false;
  } else {
    return true;
  }
}

// Sorting functions for card grids:
// 0 = cost, 1 = name, 2 = type, 3 = source
// (Note: We convert numbers to base-36 to preserve sorting. eg. "10" < "9" but "a" > "9".)
export const sortFunctions = [
  c => [c.cost.toString(36), c.name],
  c => c.name,
  c => [typeToString(c.type), c.cost.toString(36), c.name],
  c => [c.source === 'builtin', c.cost.toString(36), c.name]
];

//
// 3. Text parsing.
//

export function replaceSynonyms(text) {
  return reduce(SYNONYMS, ((str, synonyms, term) =>
    str.replace(new RegExp(`(${synonyms.join('|')})`, 'g'), term)
       .replace(new RegExp(`(${synonyms.map(capitalize).join('|')})`, 'g'), capitalize(term))
  ), text);
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
    const parseUrl = `${PARSER_URL}?input=${parserInput}&format=js&mode=${mode}`;

    fetch(parseUrl)
      .then(response => response.json())
      .then(json => {
        callback(idx, sentence, json);
        if (json.tokens && json.js) {
          indexParsedSentence(sentence, json.tokens, json.js);
        }
      });
  });
}

export const requestParse = debounce(parse, PARSE_DEBOUNCE_MS);

//
// 3.5. Keyword abilities.
//

const keywordRegexes = fromPairs(Object.keys(KEYWORDS).map(k =>
  [k, new RegExp(`(${k}|${capitalize(k)})`)]
));
const hintRegexes = fromPairs(Object.keys(HINTS).map(h =>
  [h, new RegExp(`(${h}|${capitalize(h)})`)]
));

function phrases(sentence) {
  return sentence.split(',')
                 .filter(s => /\S/.test(s))
                 .map(s => s.trim());
}

export function isKeywordExpression(sentence, hintsToo = false) {
  return every(phrases(sentence), p => KEYWORDS[p.toLowerCase()]);
}

export function keywordsInSentence(sentence, hintsToo = false) {
  const keywords = hintsToo ? Object.assign({}, KEYWORDS, HINTS) : KEYWORDS;
  const regexes = hintsToo ? Object.assign({}, keywordRegexes, hintRegexes) : keywordRegexes;

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

//
// 3. Import/export.
//

export function cardsToJson(cards) {
  cards = cards.map(c => Object.assign({}, c, {schemaVersion: CARD_SCHEMA_VERSION}));
  return JSON.stringify(cards).replace(/\\"/g, '%27');
}

export function cardsFromJson(json) {
  // In the future, we may update the card schema, and this function would have to deal
  // with migrating between schema versions.
  return JSON.parse(json.replace(/%27/g, '\\"'));
}

export function loadCardsFromFirebase(state, data) {
  if (data) {
    state.cards = uniqBy(state.cards.concat(data.cards || []), 'id');
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
