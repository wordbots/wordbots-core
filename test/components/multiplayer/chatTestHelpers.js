import { defaults } from 'lodash';

export const makeMessage = (msg) => {
  msg = msg || {};
  const defaultMessage = {
    user: 'some-player',
    text: 'test-text',
    cards: undefined
  };

  defaults(msg, defaultMessage);
  return msg;
};

export const makeChatMessage = makeMessage;
export const makeGameMessage = () => makeMessage({
  user: '[Game]'
});
export const makeServerMessage = () => makeMessage({
  user: '[Server]'
});
