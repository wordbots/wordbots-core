import React, { Component } from 'react';
import { func, object } from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

export default class Activate extends Component {
  static propTypes = {
    piece: object,
    onClick: func
  };

  constructor() {
    super();

    this.state = {
      selectedAbility: 0
    };
  }

  render() {
    if (this.props.piece) {
      const abilities = this.props.piece.activatedAbilities || [];
      return (
        <div>
          <SelectField
            disabled={abilities.length === 0}
            value={this.state.selectedAbility}
            onChange={(e, i, value) => { this.setState({selectedAbility: value}); }}
            style={{
              display: 'block',
              width: 250,
              fontSize: 13
          }}>
            {abilities.length > 0 ? abilities.map((ability, idx) => (
              <MenuItem key={idx} value={idx} primaryText={`${ability.text}.`} style={{fontSize: 13}} />
            )) : (
              <MenuItem value={0} primaryText="[No activated abilities]" />
            )}
          </SelectField>
          <RaisedButton
            disabled={abilities.length === 0 || this.props.piece.cantActivate}
            label="Activate"
            backgroundColor="rgb(244, 67, 54)"
            buttonStyle={{
              width: 200,
              border: '1px solid black'
            }}
            labelStyle={{
              fontFamily: 'Carter One',
              fontSize: 16,
              padding: '2px 15px',
              color: 'white'
            }}
            onTouchTap={() => { this.props.onClick(this.state.selectedAbility); }} />
        </div>
      );
    } else {
      return null;
    }
  }
}
