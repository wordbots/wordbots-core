/** Utility methods relating to in-game card rewrite effects. (This is a bleeding-edge feature.) */

import { GLOBAL_DISPATCH_DANGEROUS } from '../../common/store/configureStore';
import { inGameParseCompleted } from '../actions/game';
import * as w from '../types';

import { parseCard } from './cards';
import { findCardInHand, isMyTurn } from './game';

/** TODO docstring */
export function tryToRewriteCard(state: w.GameState, card: w.CardInGame, newCardText: string, _highlightedText: string): void {
  state.isWaitingForParses = true;
  state.numParsesInFlight = state.numParsesInFlight + 1;

  // TODO update comment
  // Asynchronously request parses and update the state again, and pray that react+redux handles this fine
  // TODO handle parse failures - what should the behavior be?
  parseCard(
    { ...card, text: newCardText },
    (parsedCard: w.CardInStore) => {
      GLOBAL_DISPATCH_DANGEROUS(
        inGameParseCompleted({ cardId: card.id, newCardText, parseResult: parsedCard })
      );
    },
    (error: string) => {
      GLOBAL_DISPATCH_DANGEROUS(
        inGameParseCompleted({ cardId: card.id, newCardText, parseResult: { error }})
      );
    }
  );
}

export function handleRewriteParseSucceeded(state: w.GameState, cardId: w.CardId, newCardText: string, parseResult: w.CardInStore): w.GameState {
  if (!state.isWaitingForParses) { return { ...state, numParsesInFlight: 0 }; }

  // TODO how would this ever work with obfuscated cards?
  const card: w.CardInGame | undefined = findCardInHand(state, cardId) as w.CardInGame | undefined;

  // The parse succeeded! Now we can finally update the card in question.
  Object.assign(card, {
    text: newCardText,
    // TODO support highlighting the modified part of the text (maybe using https://www.npmjs.com/package/react-highlight-words)
    // highlightedText: highlightedText
    command: parseResult.command,
    abilities: parseResult.abilities
  });

  return {
    ...state,
    numParsesInFlight: state.numParsesInFlight - 1
  };
}

export function handleRewriteParseFailed(state: w.GameState, error: string): w.GameState {
  if (!state.isWaitingForParses) { return { ...state, numParsesInFlight: 0 }; }

  // Display an error only to the player performing this action
  if (isMyTurn(state)) {
    // Can't use logAction() because we are no longer working with the right state inside this callback.
    alert(error);
  }

  return {
    ...state,
    numParsesInFlight: state.numParsesInFlight - 1
  };
}
