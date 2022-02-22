import Paper from '@material-ui/core/Paper';
import * as React from 'react';

import * as m from '../../../server/multiplayer/multiplayer';
import ProfileLink from '../users/ProfileLink';

interface LobbyStatusProps {
  connecting: boolean
  connected: boolean
  playersOnline: string[]
  myClientId: m.ClientID
  userDataByClientId: Record<m.ClientID, m.UserData>
  onConnect: () => void
}

export default class LobbyStatus extends React.PureComponent<LobbyStatusProps> {
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
      <ProfileLink
        uid={userData.uid}
        username={userData ? userData.displayName : clientId}
        style={{
          fontStyle: clientId === myClientId ? 'italic' : 'normal',
          color: '#666'
        }}
      />
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
      <div style={{ position: 'relative' }}>
        <span style={{position: 'absolute', top: -50, right: 0, fontSize: '0.85em' }}>
          {connected ? connectedSpan : (connecting ? connectingSpan : notConnectedSpan)}
        </span>

        <Paper style={{ padding: 15, marginBottom: 20, maxHeight: '2.4em', overflowY: 'auto' }}>
          <div style={{position: 'relative'}}>
            { connected ? <span>
                <b>{playersOnline.length} player{playersOnline.length === 1 ? '' : 's'} online: </b>
                {
                  playersOnline.map((clientId, idx) =>
                    <div key={clientId} style={{ display: 'inline-block' }}>
                      {renderPlayerName(userDataByClientId[clientId], clientId)}

                      {idx !== playersOnline.length - 1 && <span>,&nbsp;</span>}
                    </div>
                  )
                }
              </span> : <span>
                <b>0 players online: </b>
              </span>
            }
          </div>
        </Paper>
      </div>
    );
  }
}
