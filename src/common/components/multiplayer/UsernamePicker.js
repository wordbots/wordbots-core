import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import { debounce } from 'lodash';

class UsernamePicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: props.username
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

const { string, func } = React.PropTypes;

UsernamePicker.propTypes = {
  clientId: string,
  username: string,
  onSetUsername: func
};

export default UsernamePicker;
