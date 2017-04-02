import React from 'react';
import Paper from 'material-ui/lib/paper';

const LobbyStatus = (props) => (
  <Paper style={{padding: 20, marginBottom: 20}}>
    <div>
      <b>{props.playersOnline.length} player(s) online: </b>
      {props.playersOnline.map(p => props.usernameMap[p] || p).join(', ')}
    </div>
  </Paper>
);

const { array, object } = React.PropTypes;

LobbyStatus.propTypes = {
  playersOnline: array,
  usernameMap: object
};

export default LobbyStatus;
