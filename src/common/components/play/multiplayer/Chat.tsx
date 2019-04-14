import { chain as _, isEqual } from 'lodash';
import Divider from 'material-ui/Divider';
import Drawer from 'material-ui/Drawer';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import * as React from 'react';

import { CHAT_COLLAPSED_WIDTH, CHAT_WIDTH, CHAT_Z_INDEX } from '../../../constants';
import * as w from '../../../types';
import { id } from '../../../util/common';

import ChatMessage from './ChatMessage';

interface ChatProps {
  roomName: string | null
  messages: w.ChatMessage[]
  inGame?: boolean
  open?: boolean
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
      || this.props.fullscreen !== nextProps.fullscreen
      || this.props.messages.length !== nextProps.messages.length
      || this.props.roomName !== nextProps.roomName
      || !isEqual(this.state, nextState);
  }

  public componentDidUpdate(): void {
    this.scrollToBottom();
  }

  public render(): JSX.Element {
    const containerStyle: React.CSSProperties = {
      paddingTop: this.props.fullscreen ? 0 : 64,
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
        width={this.isClosed ? CHAT_COLLAPSED_WIDTH : CHAT_WIDTH}
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

    return _(messages)
            .groupBy((msg) => msg.id || id())
            .map(join)
            .sortBy('timestamp')
            .value();
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
      this.props.onSendMessage(this.state.chatFieldValue);
      this.scrollToBottom();
      this.setState({ chatFieldValue: '' });
    }
  }

  private toggleOptionsVisibility = () => {
    this.setState((state) => ({ optionsVisible: !state.optionsVisible }));
  }

  private toggleServerMessages = (_e: React.MouseEvent<HTMLElement>, value: boolean) => {
    this.setState({showServerMsgs: value});
  }
  private toggleGameMessages = (_e: React.MouseEvent<HTMLElement>, value: boolean) => {
    this.setState({showGameMsgs: value});
  }
  private togglePlayerChat = (_e: React.MouseEvent<HTMLElement>, value: boolean) => {
    this.setState({showChatMsgs: value});
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
          onClick={this.props.toggleChat}
        >
          <FontIcon
            className="material-icons"
            style={{
              color: 'rgba(0, 0, 0, 0.4)',
              fontSize: 24
            }}
          >
            chevron_left
          </FontIcon>
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
    const { inGame, messages, roomName, toggleChat } = this.props;
    const chatTitle = inGame ? 'Chat' : (roomName || 'Lobby');

    return (
      <div style={{height: '100%'}}>
        <Toolbar noGutter>
          <ToolbarGroup>
            <ToolbarTitle text={chatTitle} style={{ marginLeft: '0.75em' }} />
          </ToolbarGroup>
          <ToolbarGroup>
            <IconButton onClick={this.toggleOptionsVisibility} title="Toggle settings panel">
              <FontIcon color="#888" className="material-icons">settings</FontIcon>
            </IconButton>
            {inGame && (
              <IconButton onClick={toggleChat} title="Hide chat">
                <FontIcon color="#888" className="material-icons">chevron_right</FontIcon>
              </IconButton>
            )}
          </ToolbarGroup>
        </Toolbar>

        <div
          style={{
            display: this.state.optionsVisible ? 'block' : 'none'
          }}
        >
          <div style={{padding: 10}}>
            <Toggle label="Show server messages" defaultToggled onToggle={this.toggleServerMessages} />
            <Toggle label="Show game messages" defaultToggled onToggle={this.toggleGameMessages} />
            <Toggle label="Show player chat" defaultToggled onToggle={this.togglePlayerChat} />
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
}
