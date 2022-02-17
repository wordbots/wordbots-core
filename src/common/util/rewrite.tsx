/** Utility methods relating to in-game card rewrite effects. (This is a bleeding-edge feature.) */

import { escapeRegExp, find } from 'lodash';

import { inGameParseCompleted } from '../actions/game';
import { globalDispatch } from '../store/globalDispatch';
import * as w from '../types';

import { inBrowser } from './browser';
import { parseCard } from './cards';
import { currentPlayer, logAction, ownerOfCard } from './game';

/** Use the global dispatch pointer to dispatch a bundle of data relating to a parser response. */
function dispatchParseResult(parseBundle: w.InGameParseBundle): void {
  globalDispatch(inGameParseCompleted(parseBundle));
}

function incrementParseCounter(state: w.GameState): void {
  state.numParsesInFlight = state.numParsesInFlight + 1;
}

function decrementParseCounter(state: w.GameState): void {
  state.numParsesInFlight = state.numParsesInFlight - 1;
}

/**
 * Given a string and a list of string->string text replacements to make,
 * perform all replacements case-insensitively and independently of one another,
 * and also return all "highlighted" text blocks where replacements were made.
 *
 * TODO this logic is a little gnarly - a unit test would be good -AN
 */
function performTextReplacements(oldText: string, textReplacements: Array<[string, string]>): { newText: string, highlightedTextBlocks: string[] } {
  let text: string = oldText;
  const highlightedTextBlocks: string[] = [];

  // Simulate multiple "simultaneous" text-replace operations by running two passes (to avoid the replacements otherwise interfering with each other):
  // 1st pass: replace fromText -> {{$idx}}
  textReplacements.forEach(([fromText, toText], idx) => {
    // Turn fromText into a literal global, case-insensitive regex (escaping any regex special characters in the string itself)
    const fromTextRegex = new RegExp(escapeRegExp(fromText), 'gi');

    if (fromText && fromText !== toText && fromTextRegex.test(text)) {
      text = text.replace(fromTextRegex, `{{$${idx}}}`);
      highlightedTextBlocks.push(toText);
    }
  });

  // 2nd pass: replace {{$idx}} -> toText
  textReplacements.forEach(([_fromText, toText], idx) => {
    text = text.replace(new RegExp(escapeRegExp(`{{$${idx}}}`), 'g'), toText);
  });

  return {
    newText: text,
    highlightedTextBlocks
  };
}

/**
 * If a card's text matches the search criteria, try to rewrite it by triggering a parser call.
 * When the parser responds, an IN_GAME_PARSE_COMPLETED action is dispatched.
 * The actual rewrite happens in handleRewriteParseCompleted() if the parse succeeds.
 */
export function tryToRewriteCard(state: w.GameState, card: w.CardInGame, textReplacements: Record<string, string>): void {
  // Recall that the server will perform game actions along with the clients,
  // in order to track game state and check for the winner.
  // We obviously can't have the server call out to the parser for a bunch of reasons
  // (no access to fetch or globalDispatch, plus it's slow and insane to do this).
  // Instead the server will just treat the action['rewriteCard'] operation itself as a no-op,
  // and will simply process the IN_GAME_PARSE_COMPLETED redux actions so its state is consistent with the clients.
  if (!inBrowser()) { return; }

  if (card.text) {
    const { newText, highlightedTextBlocks } = performTextReplacements(card.text, Object.entries(textReplacements));
    if (newText !== card.text) {
      const cardOwner: w.PlayerColor = ownerOfCard(state, card)!.color;
      const parseBundle: Omit<w.InGameParseBundle, 'parseResult'> = {
        card: {
          id: card.id,
          cardOwner,
          name: card.name,
          oldText: card.text
        },
        newCardText: newText,
        highlightedTextBlocks
      };

      incrementParseCounter(state);

      // Asynchronously request parses and dispatch an IN_GAME_PARSE_COMPLETED action upon parse success/failure
      parseCard(
        { ...card, text: newText },
        (parsedCard: w.CardInStore) => dispatchParseResult({ ...parseBundle, parseResult: parsedCard }),
        (error: string) => dispatchParseResult({ ...parseBundle, parseResult: { error }}),
        {
          disableIndexing: true,
          fastMode: true
        }
      );
    }
  }
}

/**
 * Handle a parser response to tryToRewriteCard(),
 * updating the card if the parse succeeds,
 * or reporting an error if the parse fails.
 */
export function handleRewriteParseCompleted(state: w.GameState, parseBundle: w.InGameParseBundle): w.GameState {
  const { card: { cardOwner, name, oldText }, newCardText, highlightedTextBlocks, parseResult } = parseBundle;
  const player = currentPlayer(state);

  decrementParseCounter(state);

  // Find the card being rewritten
  // TODO once we allow rewriting objects, some of this will have to change
  // TODO how would this ever work with obfuscated cards?
  const card: w.CardInGame | undefined = find(state.players[cardOwner].hand as w.CardInGame[], { name, text: oldText });

  if (card) {
    if ('error' in parseResult) {
      // The parse failed!
      // Log a message for the player performing this action IF it is their own card that failed parsing
      // (to prevent leaking information about opponents' cards)
      if (cardOwner === state.player) {
        logAction(state, player, `failed to rewrite |${card.id}| card: ${parseResult.error}`, { [card.id]: card });
        state.players[state.currentTurn].status = { type: 'error', message: `Failed to rewrite "${card.name}" card: ${parseResult.error}` };
      }
    } else {
      // The parse succeeded! Now we can finally update the card in question.
      Object.assign(card, {
        text: newCardText,
        highlightedTextBlocks,
        command: parseResult.command,
        abilities: parseResult.abilities
      } as Partial<w.CardInGame>);

      // Log a message for the player performing this action IF it is their own card that got rewritten
      // (to prevent leaking information about opponents' cards)
      if (cardOwner === state.player) {
        logAction(state, player, `rewrote |${card.id}|'s text from "${oldText}" to "${newCardText}"`, { [card.id]: card });
      }
    }
  }

  return state;
}
