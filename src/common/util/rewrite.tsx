/** Utility methods relating to in-game card rewrite effects. (This is a bleeding-edge feature.) */

import * as w from '../types';

import { parseCard } from './cards';
import { isMyTurn } from './game';

let WAITING_FOR_PARSES = false;
let NUM_PARSES_IN_FLIGHT = 0;

// Father forgive me for I have sinned -AN
function showParsingIndicator() {
  const parsingIndicator: HTMLElement | null = window.document.querySelector<HTMLElement>('#parsingIndicator');
  if (parsingIndicator) {
    parsingIndicator.style.display = 'block';
  }
}
function hideParsingIndicator() {
  const parsingIndicator: HTMLElement | null = window.document.querySelector<HTMLElement>('#parsingIndicator');
  if (parsingIndicator) {
    parsingIndicator.style.display = 'none';
  }
}

function updateParsingIndicator() {
  if (!WAITING_FOR_PARSES) {
    NUM_PARSES_IN_FLIGHT = 0;
  }

  if (NUM_PARSES_IN_FLIGHT === 0) {
    hideParsingIndicator();
  } else {
    showParsingIndicator();
  }
}

export function stopWaitingForParses(): void {
  WAITING_FOR_PARSES = false;
  NUM_PARSES_IN_FLIGHT = 0;
  hideParsingIndicator();
}

/** TODO docstring */
export function tryToRewriteCard(state: w.GameState, card: w.CardInGame, newCardText: string, _highlightedText: string): void {
  // TODO while the spinner is going, disallow any other game actions
  // TODO also stop game timer while parsing?
  // Father forgive me for I have sinned -AN

  WAITING_FOR_PARSES = true;
  NUM_PARSES_IN_FLIGHT++;
  updateParsingIndicator();

  // Asynchronously request parses and update the state again, and pray that react+redux handles this fine
  // TODO handle parse failures - what should the behavior be?
  parseCard(
    { ...card, text: newCardText },
    (parsedCard: w.CardInStore) => {
      if (!WAITING_FOR_PARSES) { return; }

      NUM_PARSES_IN_FLIGHT--;
      updateParsingIndicator();

      // The parse succeeded! Now we can finally update the card in question.
      Object.assign(card, {
        text: newCardText,
        // TODO support highlighting the modified part of the text (maybe using https://www.npmjs.com/package/react-highlight-words)
        // highlightedText: highlightedText
        command: parsedCard.command,
        abilities: parsedCard.abilities
      });
    },
    (errorMessage: string) => {
      if (!WAITING_FOR_PARSES) { return; }

      NUM_PARSES_IN_FLIGHT--;
      updateParsingIndicator();

      // Display an error only to the player performing this action
      if (isMyTurn(state)) {
        // Can't use logAction() because we are no longer working with the right state inside this callback.
        alert(errorMessage);
      }
    }
  );
}
