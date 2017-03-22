import { id } from '../util/common';

const defaultState = {
  id: null,  // Only exists for existing cards that are being edited (not new cards).
  name: '',
  spriteID: id(),
  type: 0,
  sentences: [],
  attack: 1,
  speed: 1,
  health: 1,
  energy: 1,
  setText: null  // Used to inject text into the card creation form (e.g. when a card is loaded for editing).
};

export default defaultState;
