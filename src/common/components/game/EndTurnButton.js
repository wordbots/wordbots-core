import React, { Component } from 'react';
import { string, bool, func } from 'prop-types';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';

export default class EndTurnButton extends Component {
  static propTypes = {
    player: string,
    currentTurn: string,
    gameOver: bool,
    isMyTurn: bool,
    isAttackHappening: bool,

    onPassTurn: func
  };

  render() {
    return (
      <RaisedButton
        backgroundColor="#111"
        buttonStyle={{
          height: '64px',
          lineHeight: '64px'
        }}
        style={{
          borderRadius: 5,
          border: '2px solid #AAA'
        }}
        label="End Turn"
        labelStyle={{
          color: '#FFF',
          fontSize: 32,
          fontFamily: 'Carter One'
        }}
        overlayStyle={{
          height: '64px'
        }}
        onTouchTap={() => { this.props.onPassTurn(this.props.player); }}
        icon={
          <FontIcon 
            className="material-icons"
            style={{
              lineHeight: '64px',
              verticalAlign: 'none'
            }}>timer</FontIcon>
        }
        disabled={!this.props.isMyTurn || this.props.isAttackHappening || this.props.gameOver} />
    );
  }
}
