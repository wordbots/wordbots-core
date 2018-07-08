import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Spinner from 'react-spinkit';

const Waiting = () => (
  <Paper style={{
    display: 'flex',
    alignItems: 'center',
    padding: 20,
    marginBottom: 20
  }}>
    <Spinner name="ball-clip-rotate" style={{ marginRight: 15 }}/>
    <div>Waiting for an opponent ...</div>
  </Paper>
);

export default Waiting;
