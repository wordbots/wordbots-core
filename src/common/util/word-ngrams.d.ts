declare module 'word-ngrams' {
  type NGramProbs = UnigramProbs | BigramProbs | TrigramProbs;
  interface UnigramProbs {
    [word: string]: number;
  }
  interface BigramProbs {
    [word: string]: UnigramProbs
  }
  interface TrigramProbs {
    [word: string]: BigramProbs
  }

  export const buildNGrams: (text: string, unit?: number, options?: any) => NGramProbs;
  export const listAllNGrams: (nGrams: NGramProbs) => string[];
}
