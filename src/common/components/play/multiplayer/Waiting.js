import * as React from 'react';
import { bool, func, number, string } from 'prop-types';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { Pulse } from 'better-react-spinkit';

const Waiting = ({ inQueue, queueFormat, queueSize, onLeaveQueue }) => (
  <Paper style={{
    display: 'flex',
    alignItems: 'center',
    padding: 20,
    marginBottom: 20
  }}>
    <Pulse style={{ marginRight: 15 }} />
    <div style={{
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div>
        <div>
          Waiting for an opponent
          { inQueue && ` in the '${queueFormat}' queue` }
          {' '}...
        </div>
      </div>
      { inQueue &&
        <div>
          {queueSize} player(s) in queue.{' '}
          <Button
            variant="outlined"
            color="secondary"
            onTouchTap={onLeaveQueue}
          >
            Leave Queue
          </Button>
        </div>
      }
    </div>
  </Paper>
);

Waiting.propTypes = {
  inQueue: bool.isRequired,
  queueFormat: string,
  queueSize: number,
  onLeaveQueue: func
};

Waiting.defaultProps = {
  inQueue: false
};

export default Waiting;
