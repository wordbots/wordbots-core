import * as React from 'react';
import { arrayOf, bool, func, object, string } from 'prop-types';
import Paper from '@material-ui/core/Paper';

const LobbyStatus = (props) => {
  const { connecting, connected, playersOnline, myClientId, userDataByClientId, onConnect } = props;

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

  const renderPlayerName = (userData, clientId) => (
    (userData && !userData.uid.startsWith('guest_')) ? renderRegisteredPlayer(userData, clientId) :
      renderGuestPlayerName(userData, clientId)
  );

  /* eslint-disable react/no-multi-comp */
  const renderRegisteredPlayer = (userData, clientId) => (
    <a 
      style={{
        fontStyle: clientId === myClientId ? 'italic' : 'normal',
        textDecoration: 'underline',
        color: '#666'
      }}
      href={userData && `/profile/${userData.uid}`}
      target="_blank"
      rel="noopener noreferer"
    >
      {userData ? userData.displayName : clientId}
    </a>
  );

  const renderGuestPlayerName = (userData, clientId) => (
    <span 
      style={{
        fontStyle: clientId === myClientId ? 'italic' : 'normal',
        color: '#666'
      }}
    >
      {userData && userData ? userData.displayName : clientId}
    </span>
  );

  return (
    <Paper style={{padding: 20, marginBottom: 20}}>
      <div style={{position: 'relative'}}>
        { connected ? <span>
            <b>{playersOnline.length} player(s) online: </b>
            {
              playersOnline.map((clientId, idx) => 
                <React.Fragment key={clientId}>
                  { renderPlayerName(userDataByClientId[clientId], clientId) }

                  { idx !== playersOnline.length - 1 && <span>,&nbsp;</span> }
                </React.Fragment>
              )
            }
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
  myClientId: string,
  playersOnline: arrayOf(string),
  userDataByClientId: object,
  onConnect: func
};

export default LobbyStatus;
