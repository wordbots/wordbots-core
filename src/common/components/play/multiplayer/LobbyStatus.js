import * as React from 'react';
import { arrayOf, bool, func, object, string } from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

const styles = {
  playersOnline: {
    '& span::after': {
      content: '", "'
    },
    '& span:last-of-type::after': {
      content: '""'
    }
  }
};

const LobbyStatus = (props) => {
  const { connecting, connected, playersOnline, myClientId, userDataByClientId, classes, onConnect } = props;

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
        { connected ? <span className={classes.playersOnline}>
            <b>{playersOnline.length} player(s) online: </b>
            {playersOnline.map(clientId =>
              <span key={clientId} style={{ fontStyle: clientId === myClientId ? 'italic' : 'normal' }}>
                {userDataByClientId[clientId] ? userDataByClientId[clientId].displayName : clientId}
              </span>
            )}
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
  classes: object,
  onConnect: func
};

export default withStyles(styles)(LobbyStatus);
