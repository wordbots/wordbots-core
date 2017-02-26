const defaultState = {
  name: '',
  spriteID: Math.random().toString(36).slice(2, 16),
  type: 0,
  sentences: [],
  attack: 1,
  speed: 1,
  health: 1,
  energy: 1
};

export default defaultState;
