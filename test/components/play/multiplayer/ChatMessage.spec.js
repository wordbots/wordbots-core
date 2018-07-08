import * as React from 'react';
import { shallow } from 'enzyme';
import { defaults } from 'lodash';

import ChatMessage from '../../../../src/common/components/play/multiplayer/ChatMessage';

import { makeMessage, makeChatMessage, makeGameMessage, makeServerMessage } from './chatTestHelpers';

const getWrapper = (props) => {
  const defaultProps = {
    message: {},
    idx: 0
  };

  defaults(props, defaultProps);
  return shallow(<ChatMessage
    message={props.message}
    idx={props.idx}
  />);
};

const findMessage = (wrapper) => wrapper.find('div[name="chat-message"]');

const checkRenderedMessageColor = (wrapper, color) => {
  expect(findMessage(wrapper).prop('style').color).toEqual(color);
};

const checkRenderedCardTooltipLength = (wrapper, length) => {
  expect(findMessage(wrapper).find('CardTooltip')).toHaveLength(length);
};

describe('ChatMessage tests', () => {
  describe('Message rendering tests', () => {
    it('should be colored #888 for [Game] messages', () => {
      const wrapper = getWrapper({
        message: makeGameMessage()
      });

      checkRenderedMessageColor(wrapper, '#888');
    });

    it('should be colored #888 for [Server] messages', () => {
      const wrapper = getWrapper({
        message: makeServerMessage()
      });

      checkRenderedMessageColor(wrapper, '#888');
    });

    it('should be colored #000 for other messages', () => {
      const wrapper = getWrapper({
        message: makeChatMessage()
      });

      checkRenderedMessageColor(wrapper, '#000');
    });

    it('should prepend the user off the message', () => {
      const message = makeChatMessage();
      const wrapper = getWrapper({
        message
      });

      const renderedMessage = findMessage(wrapper);
      expect(renderedMessage.find('b').text()).toEqual(message.user);
    });

    it('should ignore the | character', () => {
      const firstMessage = 'gg';
      const secondMessage = 'ez';
      const message = makeMessage({
        text: `${firstMessage}|${secondMessage}`
      });
      const wrapper = getWrapper({
        message
      });

      const renderedMessage = findMessage(wrapper).find('span');
      expect(renderedMessage.at(0).text()).toEqual(firstMessage);
      expect(renderedMessage.at(1).text()).toEqual(secondMessage);
    });

    it('should render CardTooltip if message contains card for phrase', () => {
      const messageText = 'this is a message';
      const cards = {};
      cards[messageText] = {};
      const message = makeMessage({
        text: messageText,
        cards
      });
      const wrapper = getWrapper({
        message
      });

      checkRenderedCardTooltipLength(wrapper, 1);
    });

    it('should render N CardTooltip if message has N phrases', () => {
      const firstMessage = 'gg';
      const secondMessage = 'ez';
      const cards = {};
      cards[firstMessage] = {};
      cards[secondMessage] = {};
      const message = makeMessage({
        text: `${firstMessage}|${secondMessage}`,
        cards
      });
      const wrapper = getWrapper({
        message
      });

      checkRenderedCardTooltipLength(wrapper, 2);
    });

    it('should not render CardTooltip if message does not contain card for phrase', () => {
      const messageText = 'this is a message';
      const cards = {};
      cards['foo'] = {};
      const message = makeMessage({
        text: messageText,
        cards
      });
      const wrapper = getWrapper({
        message
      });

      checkRenderedCardTooltipLength(wrapper, 0);
    });

    it('should not render CardTooltip if message cards is undefined', () => {
      const messageText = 'this is a message';
      const message = makeMessage({
        text: messageText,
        cards: undefined
      });
      const wrapper = getWrapper({
        message
      });

      checkRenderedCardTooltipLength(wrapper, 0);
    });

    it('should not render CardTooltip if message cards is null', () => {
      const messageText = 'this is a message';
      const message = makeMessage({
        text: messageText,
        cards: null
      });
      const wrapper = getWrapper({
        message
      });

      checkRenderedCardTooltipLength(wrapper, 0);
    });
  });
});
