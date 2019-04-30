import Paper from '@material-ui/core/Paper';
import * as React from 'react';

import * as m from '../../../server/multiplayer/multiplayer';

interface LobbyStatusProps {
  connecting: boolean
  connected: boolean
  playersOnline: string[]
  myClientId: m.ClientID
  userDataByClientId: Record<m.ClientID, m.UserData>
  onConnect: () => void
}

export default class LobbyStatus extends React.Component<LobbyStatusProps> {
  public render(): JSX.Element {
    const { connecting, connected, playersOnline, myClientId, userDataByClientId, onConnect } = this.props;

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

    const renderPlayerName = (userData: m.UserData, clientId: m.ClientID) => (
      (userData && !userData.uid.startsWith('guest_')) ? renderRegisteredPlayer(userData, clientId) :
        renderGuestPlayerName(userData, clientId)
    );

    const renderRegisteredPlayer = (userData: m.UserData, clientId: m.ClientID) => (
      <a
        style={{
          fontStyle: clientId === myClientId ? 'italic' : 'normal',
          textDecoration: 'underline',
          color: '#666'
        }}
        href={userData && `/profile/${userData.uid}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {userData ? userData.displayName : clientId}
      </a>
    );

    const renderGuestPlayerName = (userData: m.UserData, clientId: m.ClientID) => (
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
                    {renderPlayerName(userDataByClientId[clientId], clientId)}

                    {idx !== playersOnline.length - 1 && <span>,&nbsp;</span>}
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
  }
}
