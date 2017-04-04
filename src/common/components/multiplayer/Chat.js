import React, { Component } from 'react';
import Drawer from 'material-ui/lib/left-nav';
import Toggle from 'material-ui/lib/toggle';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';
import ToolbarTitle from 'material-ui/lib/toolbar/toolbar-title';
import TextField from 'material-ui/lib/text-field';
import Divider from 'material-ui/lib/divider';
import { sortBy } from 'lodash';

class Chat extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chatFieldValue: '',
      showServerMsgs: true,
      showGameMsgs: true,
      showChatMsgs: true
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
          phrase
        </span>
      );
    }
  }

  render() {
    return (
      <div>
        <Drawer openRight docked style={{paddingTop: '66px'}}>
          <Toolbar>
            <ToolbarGroup float="left">
              <ToolbarTitle text={this.props.roomName || 'Lobby'} />
            </ToolbarGroup>
          </Toolbar>

          <div>
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
            style={{padding: 10, height: 'calc(100% - 92px - 144px)', overflowY: 'scroll'}}>
            {
              sortBy(this.props.messages, 'timestamp')
                .filter(this.filterMessage.bind(this))
                .map(this.renderMessage.bind(this))
            }
          </div>

          <div style={{backgroundColor: '#fff'}}>
            <Divider />
            <TextField
              hintText="Chat"
              autoComplete="off"
              style={{margin: 10, width: 236}}
              value={this.state.chatFieldValue} onChange={this.onChatChange.bind(this)}
              onEnterKeyDown={this.onChatEnter.bind(this)}/>
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

const { array, func, string } = React.PropTypes;

Chat.propTypes = {
  roomName: string,
  messages: array,

  onSendMessage: func,
  onHoverCard: func
};

export default Chat;
