import React, { Component } from 'react';

import TextField from 'material-ui/lib/text-field';
import Paper from 'material-ui/lib/paper';

class CardCreationForm extends Component {
  render() {
    return (
      <div style={{width: '50%', padding: 64}}>
        <Paper style={{padding: 48}}>
          <TextField hintText="Name"/>
        </Paper>
      </div>
    );
  }
}

export default CardCreationForm;