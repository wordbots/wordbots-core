import * as React from 'react';
import { arrayOf, bool, func, object, string } from 'prop-types';
import Drawer from 'material-ui/Drawer';
import Toggle from 'material-ui/Toggle';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import { chain as _, isEqual } from 'lodash';

import { CHAT_WIDTH, CHAT_COLLAPSED_WIDTH, CHAT_Z_INDEX } from '../../../constants';
import { id } from '../../../util/common.ts';

import ChatMessage from './ChatMessage';

export default class Chat extends React.Component {
  static propTypes = {
    roomName: string,
    messages: arrayOf(object),
    inGame: bool,
    open: bool,
    fullscreen: bool,

    onSendMessage: func,
    toggleChat: func
  };

  state = {
    chatFieldValue: '',
    optionsVisible: false,
    showServerMsgs: true,
    showGameMsgs: true,
    showChatMsgs: true
  };

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.open !== nextProps.open
      || this.props.fullscreen !== nextProps.fullscreen
      || this.props.messages.length !== nextProps.messages.length
      || this.props.roomName !== nextProps.roomName
      || !isEqual(this.state, nextState);
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  get isClosed() {
    return this.props.inGame && !this.props.open;
  }

  scrollToBottom() {
    if (this.chat) {
      const scrollHeight = this.chat.scrollHeight;
      const height = this.chat.clientHeight;
      const maxScrollTop = scrollHeight - height;
      this.chat.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }

  mergeMessagesById(messages) {
    function join(msgs) {
      return Object.assign({}, msgs[0], {
        text: msgs.map(m => m.text).join(' '),
        cards: Object.assign({}, ...msgs.map(m => m.cards))
      });
    }

    return _(messages)
            .groupBy(msg => msg.id || id())
            .map(join)
            .sortBy('timestamp')
            .value();
  }

  filterMessage = (message) => {
    if (message.user === '[Server]') {
      return this.state.showServerMsgs;
    } else if (message.user === '[Game]') {
      return this.state.showGameMsgs;
    } else {
      return this.state.showChatMsgs;
    }
  }

  handleChatChange = (evt) => {
    this.setState({ chatFieldValue: evt.target.value });
  };

  handleChatKeypress = (evt) => {
    if (evt.charCode === 13) {
      this.props.onSendMessage(this.state.chatFieldValue);
      this.scrollToBottom();
      this.setState({ chatFieldValue: '' });
    }
  };

  toggleOptionsVisibility = () => {
    this.setState(state => ({ optionsVisible: !state.optionsVisible }));
  };

  toggleServerMessages = (e, value) => { this.setState({showServerMsgs: value}); };
  toggleGameMessages = (e, value) => { this.setState({showGameMsgs: value}); };
  togglePlayerChat = (e, value) => { this.setState({showChatMsgs: value}); };

  renderClosedChat() {
    return (
      <div>
        <div style={{
          height: 64,
          backgroundColor: 'rgb(232, 232, 232)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }} onClick={this.props.toggleChat}>
          <FontIcon className="material-icons" style={{
            color: 'rgba(0, 0, 0, 0.4)',
            fontSize: 32
          }}>fast_rewind</FontIcon>
        </div>
        <div style={{
          writingMode: 'vertical-rl',
          height: 'calc(100% - 64px)',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          fontSize: 24,
          paddingTop: 20,
          color: 'rgba(0, 0, 0, 0.4)',
          backgroundColor: 'rgb(232, 232, 232)'
        }}>Chat</div>
      </div>
    );
  }

  renderChatClose() {
    if (this.props.inGame) {
      return (
        <IconButton onClick={this.props.toggleChat}>
          <FontIcon color="#888" className="material-icons">fast_forward</FontIcon>
        </IconButton>
      );
    }
  }

  renderOpenChat() {
    const { inGame, messages, roomName, toggleChat } = this.props;
    const chatTitle = inGame ? 'Chat' : (roomName || 'Lobby');

    return (
      <div style={{height: '100%'}}>
        <Toolbar>
          <ToolbarGroup>
            <ToolbarTitle text={chatTitle} />
          </ToolbarGroup>
          <ToolbarGroup>
            <IconButton onClick={this.toggleOptionsVisibility}>
              <FontIcon color="#888" className="material-icons">settings_input_component</FontIcon>
            </IconButton>
            {inGame && (
              <IconButton onClick={toggleChat}>
                <FontIcon color="#888" className="material-icons">fast_forward</FontIcon>
              </IconButton>
            )}
          </ToolbarGroup>
        </Toolbar>

        <div style={{
          display: this.state.optionsVisible ? 'block' : 'none'
        }}>
          <div style={{padding: 10}}>
            <Toggle label="Show server messages" defaultToggled onToggle={this.toggleServerMessages} />
            <Toggle label="Show game messages" defaultToggled onToggle={this.toggleGameMessages} />
            <Toggle label="Show player chat" defaultToggled onToggle={this.togglePlayerChat} />
          </div>
          <Divider />
        </div>

        <div
          ref={(el) => {this.chat = el;}}
          style={{
            padding: 10,
            height: this.state.optionsVisible ? 'calc(100% - 92px - 144px)' : 'calc(100% - 144px)',
            overflowY: 'scroll'
          }}>
          {
            this.mergeMessagesById(messages)
              .filter(this.filterMessage)
              .map((message, idx) => <ChatMessage key={idx} message={message} idx={idx} />)
          }
        </div>

        <div style={{backgroundColor: '#fff'}}>
          <Divider />
          <TextField
            id="chat"
            hintText="Chat"
            autoComplete="off"
            style={{margin: 10, width: 236}}
            value={this.state.chatFieldValue}
            onChange={this.handleChatChange}
            onKeyPress={this.handleChatKeypress}
          />
        </div>
      </div>
    );
  }

  render() {
    const containerStyle = {
      paddingTop: this.props.fullscreen ? 0: 64,
      marginTop: 0,
      height: '100%',
      overflow: 'visible',
      boxSizing: 'border-box',
      zIndex: CHAT_Z_INDEX
    };

    return (
      <Drawer
        openSecondary
        docked
        containerStyle={containerStyle}
        width={this.isClosed ? CHAT_COLLAPSED_WIDTH : CHAT_WIDTH}>
        {this.isClosed ? this.renderClosedChat() : this.renderOpenChat()}
      </Drawer>
    );
  }
}
