import React, { Component } from 'react';
import { array, func, string, bool } from 'prop-types';
import Drawer from 'material-ui/Drawer';
import Toggle from 'material-ui/Toggle';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import { chain as _, isEqual } from 'lodash';

import { id } from '../../util/common';
import CardTooltip from '../card/CardTooltip';

export default class Chat extends Component {
  static propTypes = {
    roomName: string,
    messages: array,
    inGame: bool,
    open: bool,
    fullscreen: bool,

    onSendMessage: func,
    toggleChat: func
  };

  constructor(props) {
    super(props);

    this.state = {
      chatFieldValue: '',
      showServerMsgs: true,
      showGameMsgs: true,
      showChatMsgs: true,
      togglesVisible: false
    };
  }

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

  scrollToBottom() {
    const scrollHeight = this.chat.scrollHeight;
    const height = this.chat.clientHeight;
    const maxScrollTop = scrollHeight - height;
    this.chat.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
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

  filterMessage(message) {
    if (message.user === '[Server]') {
      return this.state.showServerMsgs;
    } else if (message.user === '[Game]') {
      return this.state.showGameMsgs;
    } else {
      return this.state.showChatMsgs;
    }
  }

  renderMessage(message, idx) {
    return (
      <div
        key={idx}
        style={{
          color: ['[Game]', '[Server]'].includes(message.user) ? '#888' : '#000',
          marginBottom: 5,
          wordBreak: 'break-word'
        }}>
        <b>{message.user}</b>: {message.text.split('|').map(phrase => this.renderPhrase(phrase, message))}
      </div>
    );
  }

  renderPhrase(phrase, message) {
    const card = (message.cards || [])[phrase];
    if (card) {
      return (
        <CardTooltip
          card={card}>
          <span
            key={id()}
            style={{fontWeight: 'bold', cursor: 'pointer'}}>
              {phrase}
          </span>
        </CardTooltip>
      );
    } else {
      return (
        <span key={id()}>
          {phrase}
        </span>
      );
    }
  }

  onChatChange(e) {
    this.setState({
      chatFieldValue: e.target.value
    });
  }

  onChatEnter() {
    this.props.onSendMessage(this.state.chatFieldValue);
    this.scrollToBottom();
    this.setState({
      chatFieldValue: ''
    });
  }

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

  renderOpenChat(chatTitle) {
    return (
      <div style={{height: '100%'}}>
        <Toolbar>
          <ToolbarGroup>
            <ToolbarTitle text={chatTitle} />
          </ToolbarGroup>
          <ToolbarGroup>
            <IconButton onClick={() => this.setState({
              chatFieldValue: this.state.chatFieldValue,
              showServerMsgs: this.state.showServerMsgs,
              showGameMsgs: this.state.showGameMsgs,
              showChatMsgs: this.state.showChatMsgs,
              togglesVisible: !this.state.togglesVisible
            })}>
              <FontIcon color="#888" className="material-icons">settings_input_component</FontIcon>
            </IconButton>
            {this.renderChatClose()}
          </ToolbarGroup>
        </Toolbar>

        <div style={{
          display: this.state.togglesVisible ? 'block' : 'none'
        }}>
          <div style={{padding: 10}}>
            <Toggle
              label="Show server messages"
              defaultToggled
              onToggle={(e, value) => { this.setState({showServerMsgs: value}); }} />
            <Toggle
              label="Show game messages"
              defaultToggled
              onToggle={(e, value) => { this.setState({showGameMsgs: value}); }} />
            <Toggle
              label="Show player chat"
              defaultToggled
              onToggle={(e, value) => { this.setState({showChatMsgs: value}); }} />
          </div>
          <Divider />
        </div>

        <div
          ref={(el) => {this.chat = el;}}
          style={{
            padding: 10,
            height: this.state.togglesVisible ? 'calc(100% - 92px - 144px)' : 'calc(100% - 144px)',
            overflowY: 'scroll'
          }}>
          {
            this.mergeMessagesById(this.props.messages)
              .filter(this.filterMessage.bind(this))
              .map(this.renderMessage.bind(this))
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
            onChange={this.onChatChange.bind(this)}
            onKeyPress={e => { if (e.charCode === 13) { this.onChatEnter(); }}}
          />
        </div>
      </div>
    );
  }

  renderDrawerContents(chatTitle) {
    if (this.isClosed()) {
      return this.renderClosedChat();
    } else {
      return this.renderOpenChat(chatTitle);
    }
  }

  isClosed() {
    return this.props.inGame && !this.props.open;
  }

  render() {
    const chatTitle = this.props.inGame ? 'Chat' : (this.props.roomName || 'Lobby');

    const containerStyle = {
      paddingTop: this.props.fullscreen ? 0: 64,
      marginTop: 0,
      height: '100%',
      overflow: 'visible',
      boxSizing: 'border-box'
    };

    return (
      <Drawer 
        openSecondary 
        docked 
        containerStyle={containerStyle}
        width={this.isClosed() ? 64 : 256}>
        {this.renderDrawerContents(chatTitle)}
      </Drawer>
    );
  }
}
