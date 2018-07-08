import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { Pulse } from 'better-react-spinkit'

const Waiting = () => (
  <Paper style={{
    display: 'flex',
    alignItems: 'center',
    padding: 20,
    marginBottom: 20
  }}>
    <Pulse style={{ marginRight: 15 }} />
    <div>Waiting for an opponent ...</div>
  </Paper>
);

export default Waiting;
