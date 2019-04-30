import * as React from 'react';
import { shallow } from 'enzyme';
import { defaults, noop } from 'lodash';

import Chat from '../../../../src/common/components/play/Chat.tsx';

import { makeMessage, makeChatMessage, makeGameMessage, makeServerMessage } from './chatTestHelpers';

const getWrapper = (props) => {
  const defaultProps = {
    open: true,
    fullscreen: false,
    toggleChat: noop,
    onSendMessage: noop,
    inGame: false,
    roomName: 'dummy name',
    messages: []
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

const updateWrapper = (wrapper) => {
  // Both are needed https://github.com/airbnb/enzyme/issues/1229
  wrapper.instance().forceUpdate();
  wrapper.update();
};

const findMessage = (wrapper) => wrapper.find('ChatMessage');

const checkRenderedMessageLength = (wrapper, length) => {
  expect(findMessage(wrapper)).toHaveLength(length);
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
  });
});
