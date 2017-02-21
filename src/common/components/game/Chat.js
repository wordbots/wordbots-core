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
      chatFieldValue: '',
      chatMessages: []
    };

    this.onChatEnter = this.onChatEnter.bind(this);
    this.onChatChange = this.onChatChange.bind(this);
  }

  render() {
    return (
      <div>
        <Drawer openRight docked style={{paddingTop: '66px'}}>
          <Toolbar>
            <ToolbarGroup float="left">
              <ToolbarTitle text="Chat" />
            </ToolbarGroup>
          </Toolbar>

          <div style={{zIndex: 1, padding: 10}}>
            {
              this.state.chatMessages.map((message) => {
                return <div style={{marginBottom: 5}}><b>{message.user}</b>: {message.text}</div>;
              })
            }
          </div>

          <div style={{position: 'absolute', bottom: 0, zIndex: 2, backgroundColor: '#fff'}}>
            <Divider />
            <TextField hintText="Chat" autoComplete="off" style={{margin: 10, width: 236}} 
              value={this.state.chatFieldValue} onChange={this.onChatChange} 
              onEnterKeyDown={this.onChatEnter}/>
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
    let newChatMessages = this.state.chatMessages;
    newChatMessages.push({
      user: 'You',
      text: this.state.chatFieldValue
    });

    this.setState({
      chatFieldValue: '',
      chatMessages: newChatMessages
    });
  }
}

export default Chat;
