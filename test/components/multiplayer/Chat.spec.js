import React from 'react';
import { shallow } from 'enzyme';
import { defaults, noop } from 'lodash';

import Chat from "../../../src/common/components/multiplayer/Chat";

const getWrapper = (props) => {
  const defaultProps = {
    open: true,
    fullscreen: false,
    toggleChat: noop,
    onSendMessage: noop,
    inGame: false,
    roomName: "dummy name",
    messages: [],
  };

  defaults(props, defaultProps);
  return shallow(<Chat
    open={props.open}
    fullscreen={props.fullscreen}
    toggleChat={props.toggleChat}
    onSendMessage={props.onSendMessage}
    inGame={props.inGame}
    messages={props.messages}
    roomName={props.roomName}
  />);
};

const makeMessage = (msg) => {
  msg = msg || {};
  const defaultMessage = {
    user: 'some-player',
    text: 'test-text',
    cards: undefined,
  };

  defaults(msg, defaultMessage);
  return msg;
};

const makeChatMessage = makeMessage;
const makeGameMessage = () => makeMessage({
  user: '[Game]'
});
const makeServerMessage = () => makeMessage({
  user: '[Server]'
});

const updateWrapper = (wrapper) => {
  // Both are needed https://github.com/airbnb/enzyme/issues/1229
  wrapper.instance().forceUpdate();
  wrapper.update();
};

const findMessage = (wrapper) => wrapper.find('div[name="chat-message"]');

const checkRenderedMessageLength = (wrapper, length) => {
  expect(findMessage(wrapper)).toHaveLength(length);
};

const checkRenderedMessageColor = (wrapper, color) => {
  expect(findMessage(wrapper).prop('style').color).toEqual(color);
};

const checkRenderedCardTooltipLength = (wrapper, length) => {
  expect(findMessage(wrapper).find('CardTooltip')).toHaveLength(length);
};

describe('Chat tests', () => {
  describe('Message rendering tests', () => {
    it('should not render messages when in game and chat closed', () => {
      const messages = [makeMessage()];
      const wrapper = getWrapper({
        inGame: true,
        open: false,
        messages
      });

      checkRenderedMessageLength(wrapper, 0);
    });

    it('should render messages when not in game and chat closed', () => {
      const messages = [makeMessage()];
      const wrapper = getWrapper({
        inGame: false,
        open: false,
        messages
      });

      checkRenderedMessageLength(wrapper, 1);
    });

    it('should properly render no messages', () => {
      const messages = [];
      const wrapper = getWrapper({
        messages
      });

      checkRenderedMessageLength(wrapper, 0);
    });

    it('should properly render one message', () => {
      const messages = [makeMessage()];
      const wrapper = getWrapper({
        messages
      });

      checkRenderedMessageLength(wrapper, 1);
    });

    it('should properly render two messages', () => {
      const messages = [makeMessage(), makeMessage()];
      const wrapper = getWrapper({
        messages
      });

      checkRenderedMessageLength(wrapper, 2);
    });

    it('should re-render messages when props messages updated', () => {
      const messages = [makeMessage(), makeMessage()];
      const wrapper = getWrapper({
        messages
      });

      checkRenderedMessageLength(wrapper, 2);

      messages.push(makeMessage());
      updateWrapper(wrapper);
      checkRenderedMessageLength(wrapper, 3);

      messages.pop();
      updateWrapper(wrapper);
      checkRenderedMessageLength(wrapper, 2);
    });

    it('should show server messages if showServerMsgs enabled', () => {
      const messages = [makeServerMessage()];
      const wrapper = getWrapper({
        messages
      });

      wrapper.instance().toggleServerMessages(null, true);
      updateWrapper(wrapper);

      checkRenderedMessageLength(wrapper, 1);
    });

    it('should hide server messages if showServerMsgs disabled', () => {
      const messages = [makeServerMessage()];
      const wrapper = getWrapper({
        messages
      });

      wrapper.instance().toggleServerMessages(null, false);
      updateWrapper(wrapper);

      checkRenderedMessageLength(wrapper, 0);
    });

    it('should show game messages if showGameMsgs enabled', () => {
      const messages = [makeGameMessage()];
      const wrapper = getWrapper({
        messages
      });

      wrapper.instance().toggleGameMessages(null, true);
      updateWrapper(wrapper);

      checkRenderedMessageLength(wrapper, 1);
    });

    it('should hide game messages if showGameMsgs disabled', () => {
      const messages = [makeGameMessage()];
      const wrapper = getWrapper({
        messages
      });

      wrapper.instance().toggleGameMessages(null, false);
      updateWrapper(wrapper);

      checkRenderedMessageLength(wrapper, 0);
    });
    
    it('should show chat messages if showChatMsgs enabled', () => {
      const messages = [makeChatMessage()];
      const wrapper = getWrapper({
        messages
      });

      wrapper.instance().togglePlayerChat(null, true);
      updateWrapper(wrapper);

      checkRenderedMessageLength(wrapper, 1);
    });

    it('should hide chat messages if showChatMsgs disabled', () => {
      const messages = [makeChatMessage()];
      const wrapper = getWrapper({
        messages
      });

      wrapper.instance().togglePlayerChat(null, false);
      updateWrapper(wrapper);

      checkRenderedMessageLength(wrapper, 0);
    });

    it('should be colored #888 for [Game] messages', () => {
      const messages = [makeGameMessage()];
      const wrapper = getWrapper({
        messages
      });

      checkRenderedMessageColor(wrapper, '#888');
    });

    it('should be colored #888 for [Server] messages', () => {
      const messages = [makeServerMessage()];
      const wrapper = getWrapper({
        messages
      });

      checkRenderedMessageColor(wrapper, '#888');
    });

    it('should be colored #000 for other messages', () => {
      const messages = [makeChatMessage()];
      const wrapper = getWrapper({
        messages
      });

      checkRenderedMessageColor(wrapper, '#000');
    });

    it('should prepend the user off the message', () => {
      const message = makeChatMessage();
      const wrapper = getWrapper({
        messages: [message]
      });

      const renderedMessage = findMessage(wrapper);
      expect(renderedMessage.find('b').text()).toEqual(message.user);
    });

    it('should ignore the | character', () => {
      const firstMessage = "gg";
      const secondMessage = "ez";
      const message = makeMessage({
        text: `${firstMessage}|${secondMessage}`
      });
      const wrapper = getWrapper({
        messages: [message]
      });

      const renderedMessage = findMessage(wrapper).find('span');
      expect(renderedMessage.at(0).text()).toEqual(firstMessage);
      expect(renderedMessage.at(1).text()).toEqual(secondMessage);
    });

    it('should render CardTooltip if message contains card for phrase', () => {
      const messageText = "this is a message";
      const cards = {};
      cards[messageText] = {};
      const message = makeMessage({
        text: messageText,
        cards,
      });
      const wrapper = getWrapper({
        messages: [message],
      });

      checkRenderedCardTooltipLength(wrapper, 1);
    });

    it('should render N CardTooltip if message has N phrases', () => {
      const firstMessage = "gg";
      const secondMessage = "ez";
      const cards = {};
      cards[firstMessage] = {};
      cards[secondMessage] = {};
      const message = makeMessage({
        text: `${firstMessage}|${secondMessage}`,
        cards,
      });
      const wrapper = getWrapper({
        messages: [message],
      });

      checkRenderedCardTooltipLength(wrapper, 2);
    });

    it('should not render CardTooltip if message does not contain card for phrase', () => {
      const messageText = "this is a message";
      const cards = {};
      cards["foo"] = {};
      const message = makeMessage({
        text: messageText,
        cards,
      });
      const wrapper = getWrapper({
        messages: [message],
      });

      checkRenderedCardTooltipLength(wrapper, 0);
    });

    it('should not render CardTooltip if message cards is undefined', () => {
      const messageText = "this is a message";
      const message = makeMessage({
        text: messageText,
        cards: undefined,
      });
      const wrapper = getWrapper({
        messages: [message],
      });

      checkRenderedCardTooltipLength(wrapper, 0);
    });
    it('should not render CardTooltip if message cards is null', () => {
      const messageText = "this is a message";
      const message = makeMessage({
        text: messageText,
        cards: null,
      });
      const wrapper = getWrapper({
        messages: [message],
      });

      checkRenderedCardTooltipLength(wrapper, 0);
    });
  });
});