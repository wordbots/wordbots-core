import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';


const Waiting = () => (
  <Paper style={{
    display: 'flex',
    alignItems: 'center',
    padding: 20,
    marginBottom: 20
  }}>
    <CircularProgress style={{ marginRight: 10 }}/>
    <div>Waiting for an opponent ...</div>
  </Paper>
);

export default Waiting;
