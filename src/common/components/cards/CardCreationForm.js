import React, { Component } from 'react';
import TextField from 'material-ui/lib/text-field';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Paper from 'material-ui/lib/paper';

class CardCreationForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cardName: '',
      cardType: ''
    } 
  }

  createMenuItems(list) {
    return list.map((text, index) => {
      return (
        <MenuItem key={index} value={index} primaryText={text}/>
      );
    });
  }

  handleChange = (event, index, value) => this.setState({value});

  render() {
    const cardTypes = ['Robot', 'Event', 'Structure'];

    return (
      <div style={{width: '50%', padding: 64}}>
        <Paper style={{padding: 48}}>
          <TextField
            floatingLabelText="Card Name" 
            style={{width: '100%'}} />
          <SelectField
            value={this.state.cardType}
            handleChange={this.handleChange}
            floatingLabelText="Card Type"
            style={{width: '100%'}} 
          >
            {this.createMenuItems(cardTypes)}
          </SelectField>
        </Paper>
      </div>
    );
  }
}

export default CardCreationForm;
