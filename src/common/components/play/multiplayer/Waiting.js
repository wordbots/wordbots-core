import * as React from 'react';
import { bool, number } from 'prop-types';
import Paper from '@material-ui/core/Paper';
import { Pulse } from 'better-react-spinkit';

const Waiting = ({ inQueue, queueSize }) => (
  <Paper style={{
    display: 'flex',
    alignItems: 'center',
    padding: 20,
    marginBottom: 20
  }}>
    <Pulse style={{ marginRight: 15 }} />
    <div>
      Waiting for an opponent ...
      { inQueue && ` ${queueSize} player(s) in queue.` }
    </div>
  </Paper>
);

Waiting.propTypes = {
  inQueue: bool,
  queueSize: number
};

export default Waiting;
