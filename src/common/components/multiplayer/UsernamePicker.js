import React, { Component } from 'react';
import { string, func } from 'prop-types';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import { debounce } from 'lodash';

export default class UsernamePicker extends Component {
  static propTypes = {
    clientId: string,
    username: string,
    onSetUsername: func
  };

  constructor(props) {
    super(props);

    this.state = {
      username: props.username || undefined
    };

    this.setUsername = debounce(username => {
      this.props.onSetUsername(username);
    }, 500);
  }

  componentDidMount() {
    if (this.props.username) {
      this.props.onSetUsername(this.props.username);
    }
  }

  componentWillUpdate(nextProps) {
    // Default username to clientId.
    if (!this.state.username && nextProps.clientId) {
      this.state.username = nextProps.clientId;
      this.props.onSetUsername(nextProps.clientId);
    }
  }

  render() {
    return (
      <Paper style={{padding: 20, marginBottom: 20}}>
        <div>Your username is:
          <TextField
            id="username"
            value={this.state.username}
            style={{marginLeft: 12, width: '50%'}}
            onChange={e => {
              this.setState({username: e.target.value});
              this.setUsername(e.target.value);
            }} />
        </div>
      </Paper>
    );
  }
}
