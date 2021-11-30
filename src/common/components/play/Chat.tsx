import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import { isEqual } from 'lodash';
import { flow, groupBy, map, sortBy } from 'lodash/fp';
import * as React from 'react';

import { CHAT_COLLAPSED_WIDTH, CHAT_NARROW_WIDTH, CHAT_WIDTH, CHAT_Z_INDEX } from '../../constants';
import * as w from '../../types';
import { id } from '../../util/common';
import { filterProfanity } from '../../util/language';

import ChatMessage from './ChatMessage';

interface ChatProps {
  roomName: string | null
  messages: w.ChatMessage[]
  inGame?: boolean
  open?: boolean
  compact?: boolean
  fullscreen?: boolean
  onSendMessage: (message: string) => void
  toggleChat?: () => void
}

interface ChatState {
  chatFieldValue: string
  optionsVisible: boolean
  showServerMsgs: boolean
  showGameMsgs: boolean
  showChatMsgs: boolean
}

export default class Chat extends React.Component<ChatProps, ChatState> {
  public state = {
    chatFieldValue: '',
    optionsVisible: false,
    showServerMsgs: true,
    showGameMsgs: true,
    showChatMsgs: true
  };

  private chat: any = null;  // TODO type this ref correctly

  get isClosed(): boolean {
    return !!this.props.inGame && !this.props.open;
  }

  public shouldComponentUpdate(nextProps: ChatProps, nextState: ChatState): boolean {
    return this.props.open !== nextProps.open
      || this.props.compact !== nextProps.compact
      || this.props.fullscreen !== nextProps.fullscreen
      || this.props.messages.length !== nextProps.messages.length
      || this.props.roomName !== nextProps.roomName
      || !isEqual(this.state, nextState);
  }

  public componentDidUpdate(): void {
    this.scrollToBottom();
  }

  public render(): JSX.Element {
    return (
      <Drawer
        open
        variant="permanent"
        anchor="right"
        PaperProps={{
          style: {
            paddingTop: this.props.fullscreen ? 0 : 64,
            marginTop: 0,
            height: '100%',
            overflow: 'visible',
            boxSizing: 'border-box',
            zIndex: CHAT_Z_INDEX,
            width: this.isClosed ? CHAT_COLLAPSED_WIDTH : (this.props.compact ? CHAT_NARROW_WIDTH : CHAT_WIDTH)
          }
        }}
      >
        {this.isClosed ? this.renderClosedChat() : this.renderOpenChat()}
      </Drawer>
    );
  }

  private scrollToBottom(): void {
    if (this.chat) {
      const scrollHeight = this.chat.scrollHeight;
      const height = this.chat.clientHeight;
      const maxScrollTop = scrollHeight - height;
      this.chat.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }

  private mergeMessagesById(messages: w.ChatMessage[]): w.ChatMessage[] {
    const join = (msgs: w.ChatMessage[]): w.ChatMessage => ({
      ...msgs[0],
      text: msgs.map((m) => m.text).join(' '),
      cards: Object.assign({}, ...msgs.map((m) => m.cards))
    });

    return flow(
      groupBy((msg: w.ChatMessage) => msg.id || id()),
      map(join),
      sortBy('timestamp')
    )(messages);
  }

  private filterMessage = (message: w.ChatMessage) => {
    if (message.user === '[Server]') {
      return this.state.showServerMsgs;
    } else if (message.user === '[Game]') {
      return this.state.showGameMsgs;
    } else {
      return this.state.showChatMsgs;
    }
  }

  private handleChatChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ chatFieldValue: evt.target.value });
  }

  private handleChatKeypress = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.charCode === 13) {
      this.props.onSendMessage(filterProfanity(this.state.chatFieldValue));
      this.scrollToBottom();
      this.setState({ chatFieldValue: '' });
    }
  }

  private toggleOptionsVisibility = () => {
    this.setState((state) => ({ optionsVisible: !state.optionsVisible }));
  }

  private toggleServerMessages = (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    this.setState({ showServerMsgs: checked });
  }
  private toggleGameMessages = (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    this.setState({ showGameMsgs: checked });
  }
  private togglePlayerChat = (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    this.setState({ showChatMsgs: checked });
  }

  private renderClosedChat(): JSX.Element {
    return (
      <div>
        <div
          style={{
            height: 64,
            backgroundColor: 'rgb(232, 232, 232)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <IconButton onClick={this.props.toggleChat}>
            <Icon
              className="material-icons"
              style={{
                color: 'rgba(0, 0, 0, 0.4)',
                fontSize: 24
              }}
            >
              chevron_left
            </Icon>
          </IconButton>
        </div>
        <div
          style={{
            writingMode: 'vertical-rl',
            height: 'calc(100% - 64px)',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            fontSize: 24,
            paddingTop: 20,
            color: 'rgba(0, 0, 0, 0.4)',
            backgroundColor: 'rgb(232, 232, 232)'
          }}
        >
          Chat
        </div>
      </div>
    );
  }

  private renderOpenChat(): JSX.Element {
    const { compact, inGame, messages, roomName, toggleChat } = this.props;
    const chatTitle = inGame ? 'Chat' : (roomName || 'Lobby');

    return (
      <div style={{height: '100%'}}>
        <Toolbar
          disableGutters
          style={{
            backgroundColor: '#e4e4e4',
            minHeight: 56,
            padding: 0,
            justifyContent: 'space-between'
          }}
        >
          <div style={{ marginLeft: '0.75em', fontSize: '1.25em', color: '#888' }}>
            {chatTitle}
          </div>
          <div>
            <IconButton onClick={this.toggleOptionsVisibility} title="Toggle settings panel">
              <Icon style={{ color: "#888" }} className="material-icons">settings</Icon>
            </IconButton>
            {inGame && (
              <IconButton onClick={toggleChat} title="Hide chat">
                <Icon style={{ color: "#888" }} className="material-icons">chevron_right</Icon>
              </IconButton>
            )}
          </div>
        </Toolbar>

        <div
          style={{
            display: this.state.optionsVisible ? 'block' : 'none'
          }}
        >
          <div style={{padding: 10, fontSize: compact ? '0.8em' : '1em' }}>
            <FormControlLabel
              control={<Switch defaultChecked color="primary" onChange={this.toggleServerMessages} />}
              label="Show server messages"
              labelPlacement="start"
              style={{ justifyContent: 'space-between', margin: '-12px 0', width: '100%' }}
            />
            <FormControlLabel
              control={<Switch defaultChecked color="primary" onChange={this.toggleGameMessages} />}
              label="Show game messages"
              labelPlacement="start"
              style={{ justifyContent: 'space-between', margin: '-12px 0', width: '100%' }}
            />
            <FormControlLabel
              control={<Switch defaultChecked color="primary" onChange={this.togglePlayerChat} />}
              label="Show player chat"
              labelPlacement="start"
              style={{ justifyContent: 'space-between', margin: '-12px 0', width: '100%' }}
            />
          </div>
          <Divider />
        </div>

        <div
          ref={(el) => {this.chat = el; }}
          style={{
            padding: 10,
            height: this.state.optionsVisible ? 'calc(100% - 92px - 144px)' : 'calc(100% - 144px)',
            overflowY: 'scroll'
          }}
        >
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
            placeholder="Chat"
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
}
