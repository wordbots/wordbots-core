export const START_PRACTICE = 'START_PRACTICE';
export const AI_RESPONSE = 'AI_RESPONSE';
export const START_TUTORIAL = 'START_TUTORIAL';
export const TUTORIAL_STEP = 'TUTORIAL_STEP';
export const END_GAME = 'END_GAME';
export const MOVE_ROBOT = 'MOVE_ROBOT';
export const ATTACK = 'ATTACK';
export const ATTACK_RETRACT = 'ATTACK_RETRACT';
export const ATTACK_COMPLETE = 'ATTACK_COMPLETE';
export const ACTIVATE_OBJECT = 'ACTIVATE_OBJECT';
export const PLACE_CARD = 'PLACE_CARD';
export const PASS_TURN = 'PASS_TURN';
export const SET_SELECTED_CARD = 'SET_SELECTED_CARD';
export const SET_SELECTED_TILE = 'SET_SELECTED_TILE';
export const SET_HOVERED_CARD = 'SET_HOVERED_CARD';
export const SET_HOVERED_TILE = 'SET_HOVERED_TILE';

export function startPractice(deck) {
  return {
    type: START_PRACTICE,
    payload: { deck }
  };
}

export function aiResponse() {
  return {
    type: AI_RESPONSE
  };
}

export function startTutorial() {
  return {
    type: START_TUTORIAL
  };
}

export function tutorialStep(back = false) {
  return {
    type: TUTORIAL_STEP,
    payload: { back }
  };
}

export function endGame() {
  return {
    type: END_GAME
  };
}

export function moveRobot(from, to) {
  return {
    type: MOVE_ROBOT,
    payload: { from, to }
  };
}

export function attack(source, target) {
  return {
    type: ATTACK,
    payload: { source, target }
  };
}

export function attackRetract() {
  return {
    type: ATTACK_RETRACT
  };
}

export function attackComplete() {
  return {
    type: ATTACK_COMPLETE
  };
}

export function activateObject(abilityIdx) {
  return {
    type: ACTIVATE_OBJECT,
    payload: { abilityIdx }
  };
}

export function placeCard(tile, cardIdx) {
  return {
    type: PLACE_CARD,
    payload: { tile, cardIdx }
  };
}

export function passTurn(player) {
  return {
    type: PASS_TURN,
    payload: { player }
  };
}

export function setSelectedCard(selectedCard, player) {
  return {
    type: SET_SELECTED_CARD,
    payload: { selectedCard, player }
  };
}

export function setSelectedTile(selectedTile, player) {
  return {
    type: SET_SELECTED_TILE,
    payload: { selectedTile, player }
  };
}

export function setHoveredCard(hoveredCard) {
  return {
    type: SET_HOVERED_CARD,
    payload: { hoveredCard }
  };
}

export function setHoveredTile(hoveredCard) {
  return {
    type: SET_HOVERED_TILE,
    payload: { hoveredCard }
  };
}
