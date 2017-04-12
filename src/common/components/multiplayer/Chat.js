import React, { Component } from 'react';
import { array, func, string } from 'prop-types';
import Drawer from 'material-ui/Drawer';
import Toggle from 'material-ui/Toggle';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import { sortBy } from 'lodash';

export default class Chat extends Component {
  static propTypes = {
    roomName: string,
    messages: array,

    onSendMessage: func,
    onHoverCard: func
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

  scrollToBottom() {
    const scrollHeight = this.chat.scrollHeight;
    const height = this.chat.clientHeight;
    const maxScrollTop = scrollHeight - height;
    this.chat.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      this.scrollToBottom();
    }
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
        <span
          key={phrase}
          style={{fontWeight: 'bold', cursor: 'pointer'}}
          onMouseOver={() => this.props.onHoverCard({card: card, stats: card.stats})}
          onMouseOut={() => this.props.onHoverCard(null)}>
            {phrase}
        </span>
      );
    } else {
      return (
        <span key={phrase}>
          {phrase}
        </span>
      );
    }
  }

  render() {
    return (
      <div>
        <Drawer openSecondary docked containerStyle={{paddingTop: '66px'}}>
          <Toolbar>
            <ToolbarGroup>
              <ToolbarTitle text={this.props.roomName || 'Lobby'} />
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
              sortBy(this.props.messages, 'timestamp')
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
        </Drawer>
      </div>
    );
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
}
