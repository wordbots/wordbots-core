import Paper from '@material-ui/core/Paper';
import { uniqBy } from 'lodash';
import * as React from 'react';

import * as m from '../../../server/multiplayer/multiplayer';
import ProfileLink from '../users/ProfileLink';

interface LobbyStatusProps {
  connecting: boolean
  connected: boolean
  playersOnline: string[]
  playersInLobby: string[]
  myClientId: m.ClientID
  userDataByClientId: Record<m.ClientID, m.UserData>
  onConnect: () => void
}

export default class LobbyStatus extends React.PureComponent<LobbyStatusProps> {
  get uniquePlayersInLobby(): m.ClientID[] {
    const { playersInLobby, userDataByClientId } = this.props;
    return uniqBy(playersInLobby, (clientId: m.ClientID) => userDataByClientId[clientId]?.uid || clientId);
  }

  get numUniquePlayersOnline(): number {
    const { playersOnline, userDataByClientId } = this.props;
    return uniqBy(playersOnline, (clientId: m.ClientID) => userDataByClientId[clientId]?.uid || clientId).length;
  }

  isCurrentUser = (clientId: m.ClientID): boolean => {
    const { myClientId, userDataByClientId } = this.props;
    const userData: m.UserData | undefined = userDataByClientId[clientId];
    return clientId === myClientId || (userData && userData.uid === userDataByClientId[myClientId]?.uid);
  }

  renderPlayerName = (userData: m.UserData | undefined, clientId: m.ClientID): JSX.Element => (
    <ProfileLink
      uid={userData?.uid}
      username={userData?.displayName || clientId}
      style={{
        fontStyle: this.isCurrentUser(clientId) ? 'italic' : 'normal',
        color: '#555'
      }}
    />
  );

  renderConnectionIndicator = (): JSX.Element => {
    const { connecting, connected, onConnect } = this.props;
    if (connected) {
      return <span style={{ color: 'green' }}>Connected</span>;
    } else if (connecting) {
      return <span>Connecting ...</span>;
    } else {
      return <a style={{ color: 'red', cursor: 'pointer' }} onClick={onConnect}>Not connected (click to retry)</a>;
    }
  }

  public render(): JSX.Element {
    const { connected, userDataByClientId } = this.props;
    return (
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', top: -50, right: 0, fontSize: '0.85em' }}>
          {this.renderConnectionIndicator()}
        </span>
        {
          connected && (
            <Paper style={{ padding: 15, marginBottom: 20, maxHeight: '2.4em', overflowY: 'auto' }}>
              <div style={{ position: 'relative' }}>
                <span>
                  <b>
                    {this.uniquePlayersInLobby.length} player{this.uniquePlayersInLobby.length === 1 ? '' : 's'} in lobby
                  {this.numUniquePlayersOnline !== this.uniquePlayersInLobby.length && <i> ({this.numUniquePlayersOnline} player{this.numUniquePlayersOnline === 1 ? '' : 's'} online)</i>}
                  :{' '}
                  </b>
                  {
                    this.uniquePlayersInLobby
                      .map((clientId) =>
                        <div key={clientId} style={{ display: 'inline-block' }}>
                          {this.renderPlayerName(userDataByClientId[clientId], clientId)}
                        </div>
                      )
                      // https://stackoverflow.com/a/35840806
                      .reduce<React.ReactNode[]>((acc, elem) => acc.length === 0 ? [elem] : [...acc, ', ', elem], [])
                  }
                </span>
              </div>
            </Paper>
          )
        }
      </div>
    );
  }
}
