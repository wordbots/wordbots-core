import * as w from '../types';

export const START_PRACTICE = 'START_PRACTICE';
export const AI_RESPONSE = 'AI_RESPONSE';
export const START_TUTORIAL = 'START_TUTORIAL';
export const TUTORIAL_STEP = 'TUTORIAL_STEP';
export const START_SANDBOX = 'START_SANDBOX';
export const END_GAME = 'END_GAME';
export const MOVE_ROBOT = 'MOVE_ROBOT';
export const ATTACK = 'ATTACK';
export const ATTACK_RETRACT = 'ATTACK_RETRACT';
export const ATTACK_COMPLETE = 'ATTACK_COMPLETE';
export const ACTIVATE_OBJECT = 'ACTIVATE_OBJECT';
export const PLACE_CARD = 'PLACE_CARD';
export const PASS_TURN = 'PASS_TURN';
export const SET_SELECTED_CARD = 'SET_SELECTED_CARD';
export const SET_SELECTED_CARD_IN_DISCARD_PILE = 'SET_SELECTED_CARD_IN_DISCARD_PILE';
export const SET_SELECTED_TILE = 'SET_SELECTED_TILE';
export const DESELECT = 'DESELECT';
export const ADD_CARD_TO_HAND = 'ADD_CARD_TO_HAND';
export const DRAFT_CARDS = 'DRAFT_CARDS';
export const SET_VOLUME = 'SET_VOLUME';
export const IN_GAME_PARSE_COMPLETED = 'IN_GAME_PARSE_COMPLETED';

export function startPractice(format: w.BuiltInFormat, deck: w.CardInStore[]): w.Action {
  return {
    type: START_PRACTICE,
    payload: { format, deck }
  };
}

export function aiResponse(): w.Action {
  return {
    type: AI_RESPONSE
  };
}

export function startTutorial(): w.Action {
  return {
    type: START_TUTORIAL
  };
}

export function tutorialStep(back = false): w.Action {
  return {
    type: TUTORIAL_STEP,
    payload: { back }
  };
}

export function startSandbox(card: w.CardInStore | null = null): w.Action {
  return {
    type: START_SANDBOX,
    payload: { card }
  };
}

export function endGame(): w.Action {
  return {
    type: END_GAME
  };
}

export function moveRobot(from: w.HexId, to: w.HexId): w.Action {
  return {
    type: MOVE_ROBOT,
    payload: { from, to }
  };
}

export function attack(source: w.HexId, target: w.HexId): w.Action {
  return {
    type: ATTACK,
    payload: { source, target }
  };
}

export function attackRetract(): w.Action {
  return {
    type: ATTACK_RETRACT
  };
}

export function attackComplete(): w.Action {
  return {
    type: ATTACK_COMPLETE
  };
}

export function activateObject(abilityIdx: number): w.Action {
  return {
    type: ACTIVATE_OBJECT,
    payload: { abilityIdx }
  };
}

export function placeCard(tile: w.HexId, cardIdx: number): w.Action {
  return {
    type: PLACE_CARD,
    payload: { tile, cardIdx }
  };
}

export function passTurn(player: w.PlayerColor): w.Action {
  return {
    type: PASS_TURN,
    payload: { player }
  };
}

export function setSelectedCard(selectedCard: number, player: w.PlayerColor): w.Action {
  return {
    type: SET_SELECTED_CARD,
    payload: { selectedCard, player }
  };
}

export function setSelectedCardInDiscardPile(selectedCardId: w.CardId, player: w.PlayerColor): w.Action {
  return {
    type: SET_SELECTED_CARD_IN_DISCARD_PILE,
    payload: { selectedCardId, player }
  };
}

export function setSelectedTile(selectedTile: w.HexId, player: w.PlayerColor): w.Action {
  return {
    type: SET_SELECTED_TILE,
    payload: { selectedTile, player }
  };
}

export function deselect(player: w.PlayerColor): w.Action {
  return {
    type: DESELECT,
    payload: { player }
  };
}

// (only used on sandbox mode)
export function addCardToHand(player: w.PlayerColor, card: w.Card): w.Action {
  return {
    type: ADD_CARD_TO_HAND,
    payload: { player, card }
  };
}

// (only used in draft format)
export function draftCards(player: w.PlayerColor, cards: w.CardInGame[]): w.Action {
  return {
    type: DRAFT_CARDS,
    payload: { player, cards }
  };
}

export function setVolume(volume: number): w.Action {
  return {
    type: SET_VOLUME,
    payload: { volume }
  };
}

export function inGameParseCompleted(payload: w.InGameParseBundle): w.Action {
  return {
    type: IN_GAME_PARSE_COMPLETED,
    payload
  };
}
