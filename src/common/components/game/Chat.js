import React, { Component } from 'react';
import Drawer from 'material-ui/lib/left-nav';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';
import ToolbarTitle from 'material-ui/lib/toolbar/toolbar-title';
import TextField from 'material-ui/lib/text-field';
import Divider from 'material-ui/lib/divider';

class Chat extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chatFieldValue: ''
    };
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

          <div style={{zIndex: 1, padding: 10}}>
            {
              this.props.messages.map((message, idx) =>
                <div
                  key={idx}
                  style={{
                    color: message.user === '[Game]' ? '#666' : '#000',
                    marginBottom: 5
                  }}>
                  <b>{message.user}</b>: {message.text}
                </div>
              )
            }
          </div>

          <div style={{position: 'absolute', bottom: 0, zIndex: 2, backgroundColor: '#fff'}}>
            <Divider />
            <TextField hintText="Chat" autoComplete="off" style={{margin: 10, width: 236}}
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
    this.setState({
      chatFieldValue: ''
    });
  }
}

const { array, func, string } = React.PropTypes;

Chat.propTypes = {
  roomName: string,
  messages: array,

  onSendMessage: func
};

export default Chat;
