import React from 'react';
import { arrayOf, bool, func, object, string } from 'prop-types';
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
  const connecting = (
    <span>Connecting ...</span>
  );

  return (
    <Paper style={{padding: 20, marginBottom: 20}}>
      <div style={{position: 'relative'}}>
        { props.connected ? <span>
            <b>{props.playersOnline.length} player(s) online: </b>
            {props.playersOnline.map(p => props.usernameMap[p] || p).join(', ')}
          </span> : <span>
            <b>0 player(s) online: </b>
          </span>
        }

        <span style={{position: 'absolute', right: 0}}>
          {props.connected ? connected : (props.connecting ? connecting : notConnected)}
        </span>
      </div>
    </Paper>
  );
};

LobbyStatus.propTypes = {
  connecting: bool,
  connected: bool,
  playersOnline: arrayOf(string),
  usernameMap: object,
  onConnect: func
};

export default LobbyStatus;
