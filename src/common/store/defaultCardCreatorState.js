import { id } from '../util';

const defaultState = {
  name: '',
  spriteID: id(),
  type: 0,
  sentences: [],
  attack: 1,
  speed: 1,
  health: 1,
  energy: 1
};

export default defaultState;
