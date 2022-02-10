/** Utility methods relating to in-game card rewrite effects. (This is a bleeding-edge feature.) */

import { inGameParseCompleted } from '../actions/game';
import { globalDispatch } from '../store/globalDispatch';
import * as w from '../types';

import { parseCard } from './cards';
import { currentPlayer, findCardInHand, isMyTurn, logAction, ownerOfCard } from './game';


/** Use the global dispatch pointer to dispatch a bundle of data relating to a parser response. */
function dispatchParseResult(parseResult: w.InGameParseResult): void {
  globalDispatch(inGameParseCompleted(parseResult));
}

function incrementParseCounter(state: w.GameState): void {
  state.isWaitingForParses = true;
  state.numParsesInFlight = state.numParsesInFlight + 1;
}

function decrementParseCounter(state: w.GameState): void {
  state.numParsesInFlight = state.numParsesInFlight - 1;
  if (state.numParsesInFlight === 0) {
    state.isWaitingForParses = false;
  }
}

/**
 * If a card's text matches the search criteria, try to rewrite it by triggering a parser call.
 * When the parser responds, an IN_GAME_PARSE_COMPLETED action is dispatched.
 * The actual rewrite happens in handleRewriteParseCompleted() if the parse succeeds.
 */
export function tryToRewriteCard(state: w.GameState, card: w.CardInGame, fromText: string, toText: string): void {
  if (card.text?.includes(fromText)) {
    // TODO make case insensitive, i.e. with https://github.com/sindresorhus/escape-string-regexp
    const newCardText: string = card.text.replaceAll(fromText, toText);
    const parseBundle: Omit<w.InGameParseResult, 'parseResult'> = { cardId: card.id, newCardText };

    incrementParseCounter(state);

    // Asynchronously request parses and dispatch an IN_GAME_PARSE_COMPLETED action upon parse success/failure
    parseCard(
      { ...card, text: newCardText },
      (parsedCard: w.CardInStore) => dispatchParseResult({ ...parseBundle, parseResult: parsedCard }),
      (error: string) => dispatchParseResult({ ...parseBundle, parseResult: { error }})
    );
  }
}

/**
 * Handle a parser response to tryToRewriteCard(),
 * updating the card if the parse succeeds,
 * or reporting an error if the parse fails.
 */
export function handleRewriteParseCompleted(state: w.GameState, parsePayload: w.InGameParseResult): w.GameState {
  const { cardId, newCardText, parseResult } = parsePayload;

  if (!state.isWaitingForParses) {
    return { ...state, numParsesInFlight: 0 };
  } else {
    decrementParseCounter(state);

    // Find the card being rewritten (if it can't be found, just throw away the parse results)
    // TODO once we allow rewriting objects, some of this will have to change
    // TODO how would this ever work with obfuscated cards?
    const card: w.CardInGame | undefined = findCardInHand(state, cardId) as w.CardInGame | undefined;
    if (card) {
      if ('error' in parseResult) {
        // The parse failed!
        handleParseFailure(state, card, parseResult.error);
      } else {
        // The parse succeeded! Now we can finally update the card in question.
        Object.assign(card, {
          text: newCardText,
          // TODO support highlighting the modified part of the text (maybe using https://www.npmjs.com/package/react-highlight-words)
          // highlightedText: highlightedText
          command: parseResult.command,
          abilities: parseResult.abilities
        });
      }
    }

    return state;
  }
}

function handleParseFailure(state: w.GameState, card: w.CardInGame, error: string): void {
  // Display an error only to the player performing this action
  // AND only if it is their card that failed parsing
  // (to prevent leaking information about opponents' cards)
  const owner = ownerOfCard(state, card);
  if (isMyTurn(state) && owner?.color === state.currentTurn) {
    logAction(state, currentPlayer(state), `Failed to rewrite |${card.id}| card: ${error}`, { [card.id]: card });
    state.players[state.currentTurn].status = {
      type: 'error',
      message: `Failed to rewrite "${card.name}" card: ${error}`
    };
  }
}
