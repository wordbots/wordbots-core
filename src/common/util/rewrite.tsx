/** Utility methods relating to in-game card rewrite effects. (This is a bleeding-edge feature.) */

import { inGameParseCompleted } from '../actions/game';
import { globalDispatch } from '../store/globalDispatch';
import * as w from '../types';

import { parseCard } from './cards';
import { currentPlayer, findCardInHand, isMyTurn, logAction, ownerOfCard } from './game';

/** TODO docstring */
export function tryToRewriteCard(state: w.GameState, card: w.CardInGame, newCardText: string, _highlightedText: string): void {
  state.isWaitingForParses = true;
  state.numParsesInFlight = state.numParsesInFlight + 1;

  // Asynchronously request parses and dispatch an IN_GAME_PARSE_COMPLETED action upon parse success/failure
  parseCard(
    { ...card, text: newCardText },
    (parsedCard: w.CardInStore) => {
      globalDispatch(inGameParseCompleted({ cardId: card.id, newCardText, parseResult: parsedCard }));
    },
    (error: string) => {
      globalDispatch(inGameParseCompleted({ cardId: card.id, newCardText, parseResult: { error }}));
    }
  );
}

/** TODO docstring */
export function handleRewriteParseCompleted(state: w.GameState, parsePayload: w.InGameParseResult): w.GameState {
  const { cardId, newCardText, parseResult } = parsePayload;

  if (!state.isWaitingForParses) {
    return { ...state, numParsesInFlight: 0 };
  } else {
    // Find the card being rewritten (if it can't be found, just throw away the parse results)
    // TODO once we allow rewriting objects, some of this will have to change
    // TODO how would this ever work with obfuscated cards?
    const card: w.CardInGame | undefined = findCardInHand(state, cardId) as w.CardInGame | undefined;
    if (card) {
      if ('error' in parseResult) {
        // The parse failed!
        // Display an error only to the player performing this action
        // AND only if it is their card that failed parsing
        // (to prevent leaking information about opponents' cards)
        const owner = ownerOfCard(state, card);
        if (isMyTurn(state) && owner?.color === state.currentTurn) {
          logAction(state, currentPlayer(state), `Failed to rewrite |${card.id}| card: ${parseResult.error}`, { [card.id]: card });
          state.players[state.currentTurn].status = {
            type: 'error',
            message: `Failed to rewrite "${card.name}" card: ${parseResult.error}`
          };
        }
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

    return {
      ...state,
      numParsesInFlight: state.numParsesInFlight - 1
    };
  }
}
