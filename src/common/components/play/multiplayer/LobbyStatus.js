import * as React from 'react';
import { arrayOf, bool, func, object, string } from 'prop-types';
import Paper from '@material-ui/core/Paper';

const LobbyStatus = (props) => {
  const { connecting, connected, playersOnline, userDataByClientId, onConnect } = props;

  const connectedSpan = (
    <span style={{color: 'green'}}>
      Connected
    </span>
  );
  const notConnectedSpan = (
    <a style={{color: 'red', cursor: 'pointer'}} onClick={onConnect}>
      Not connected
    </a>
  );
  const connectingSpan = (
    <span>Connecting ...</span>
  );

  return (
    <Paper style={{padding: 20, marginBottom: 20}}>
      <div style={{position: 'relative'}}>
        { connected ? <span>
            <b>{playersOnline.length} player(s) online: </b>
            {playersOnline.map(clientId =>
              userDataByClientId[clientId] ? userDataByClientId[clientId].displayName : clientId
            ).join(', ')}
          </span> : <span>
            <b>0 player(s) online: </b>
          </span>
        }

        <span style={{position: 'absolute', right: 0}}>
          {connected ? connectedSpan : (connecting ? connectingSpan : notConnectedSpan)}
        </span>
      </div>
    </Paper>
  );
};

LobbyStatus.propTypes = {
  connecting: bool,
  connected: bool,
  playersOnline: arrayOf(string),
  userDataByClientId: object,
  onConnect: func
};

export default LobbyStatus;
