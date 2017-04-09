import React from 'react';
import { array, bool, func, object } from 'prop-types';
import Paper from 'material-ui/Paper';

const LobbyStatus = (props) => {
  const connected = (
    <span style={{color: 'green'}}>
      Connected
    </span>
  );
  const notConnected = (
    <a style={{color: 'red', cursor: 'pointer'}}
       onClick={props.onConnect}>
      Not connected
    </a>
  );

  return (
    <Paper style={{padding: 20, marginBottom: 20}}>
      <div style={{position: 'relative'}}>
        <b>{props.playersOnline.length} player(s) online: </b>
        {props.playersOnline.map(p => props.usernameMap[p] || p).join(', ')}

        <span style={{position: 'absolute', right: 0}}>
          {props.connected ? connected : notConnected}
        </span>
      </div>
    </Paper>
  );
};

LobbyStatus.propTypes = {
  connected: bool,
  playersOnline: array,
  usernameMap: object,
  onConnect: func
};

export default LobbyStatus;
