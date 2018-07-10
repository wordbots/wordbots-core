import * as w from '../types';
import { id } from '../util/common.ts';

const defaultState: w.CreatorState = {
  id: null,  // Only exists for existing cards that are being edited (not new cards).
  name: '',
  spriteID: id(),
  type: 0,
  text: '',
  sentences: [],
  attack: 1,
  speed: 1,
  health: 1,
  energy: 1,
  parserVersion: null
};

export default defaultState;
