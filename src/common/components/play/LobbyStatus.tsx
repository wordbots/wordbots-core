import Paper from '@material-ui/core/Paper';
import { uniqBy } from 'lodash';
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
  get uniquePlayersOnline(): m.ClientID[] {
    const { playersOnline, userDataByClientId } = this.props;
    return uniqBy(playersOnline, (clientId: m.ClientID) => userDataByClientId[clientId]?.uid || clientId);
  }

  isCurrentUser = (clientId: m.ClientID): boolean => {
    const { myClientId, userDataByClientId } = this.props;
    const userData: m.UserData | undefined = userDataByClientId[clientId];
    return clientId === myClientId || (userData && userData.uid === userDataByClientId[myClientId]?.uid);
  }

  renderPlayerName = (userData: m.UserData, clientId: m.ClientID): JSX.Element => (
    (userData && !userData.uid.startsWith('guest_')) ? this.renderRegisteredPlayer(userData, clientId) :
      this.renderGuestPlayerName(userData, clientId)
  );

  renderRegisteredPlayer = (userData: m.UserData, clientId: m.ClientID): JSX.Element => (
    <ProfileLink
      uid={userData.uid}
      username={userData ? userData.displayName : clientId}
      style={{
        fontStyle: this.isCurrentUser(clientId) ? 'italic' : 'normal',
        color: '#666'
      }}
    />
  );

  renderGuestPlayerName = (userData: m.UserData, clientId: m.ClientID): JSX.Element => (
    <span
      style={{
        fontStyle: this.isCurrentUser(clientId) ? 'italic' : 'normal',
        color: '#666'
      }}
    >
      {userData && userData ? userData.displayName : clientId}
    </span>
  );

  public render(): JSX.Element {
    const { connecting, connected, userDataByClientId, onConnect } = this.props;

    const connectedSpan = (
      <span style={{ color: 'green' }}>
        Connected
      </span>
    );
    const notConnectedSpan = (
      <a style={{ color: 'red', cursor: 'pointer' }} onClick={onConnect}>
        Not connected
      </a>
    );
    const connectingSpan = (
      <span>Connecting ...</span>
    );

    return (
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', top: -50, right: 0, fontSize: '0.85em' }}>
          {connected ? connectedSpan : (connecting ? connectingSpan : notConnectedSpan)}
        </span>

        {
          connected &&
          <Paper style={{ padding: 15, marginBottom: 20, maxHeight: '2.4em', overflowY: 'auto' }}>
            <div style={{ position: 'relative' }}>
              <span>
                <b>{this.uniquePlayersOnline.length} player{this.uniquePlayersOnline.length === 1 ? '' : 's'} online: </b>
                {
                  this.uniquePlayersOnline.map((clientId, idx) =>
                    <div key={clientId} style={{ display: 'inline-block' }}>
                      {this.renderPlayerName(userDataByClientId[clientId], clientId)}

                      {idx !== this.uniquePlayersOnline.length - 1 && <span>,&nbsp;</span>}
                    </div>
                  )
                }
              </span>
            </div>
          </Paper>
        }
      </div >
    );
  }
}
