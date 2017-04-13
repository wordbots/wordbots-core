import React from 'react';
import { bool, func } from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';

const EndTurnButton = ({enabled, onClick}) => (
  <div style={{position: 'absolute', top: 0, bottom: 0, right: 0, height: 36, margin: 'auto', color: 'white'}}>
    <RaisedButton
      disabled={!enabled}
      label="End Turn"
      backgroundColor="rgb(244, 67, 54)"
      buttonStyle={{
        border: '1px solid black',
        height: 56
      }}
      overlayStyle={{
        height: 36,
        padding: '10px 0'
      }}
      labelStyle={{
        fontFamily: 'Carter One',
        fontSize: 24,
        padding: 20,
        color: 'white'
      }}
      onTouchTap={onClick} />
  </div>
);

EndTurnButton.propTypes = {
  enabled: bool,
  onClick: func
};

export default EndTurnButton;
