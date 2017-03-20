import { every, fromPairs, reduce } from 'lodash';

// Helper methods relating to handling of keyword abilities.

const KEYWORDS = {
  'defender': 'This robot can\'t attack',
  'haste': 'This robot can move and attack immediately after it is played',
  'jump': 'This robot can move over other objects',
  'taunt': 'Your opponent\'s adjacent robots can only attack this object'
};

function phrases(sentence) {
  return sentence.split(',')
                 .filter(s => /\S/.test(s))
                 .map(s => s.trim());
}

export function isKeywordExpression(sentence) {
  return every(phrases(sentence), p => KEYWORDS[p.toLowerCase()]);
}

export function keywordsInSentence(sentence) {
  if (isKeywordExpression(sentence)) {
    return fromPairs(phrases(sentence).map(p => [p, KEYWORDS[p.toLowerCase()]]));
  } else {
    return {};
  }
}

export function expandKeywords(sentence) {
  const keywords = keywordsInSentence(sentence);
  return reduce(keywords, (str, def, keyword) => str.replace(keyword, def), sentence);
}
