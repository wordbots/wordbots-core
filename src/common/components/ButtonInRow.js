import React from 'react';
import { bool, func, string } from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';

import Tooltip from './Tooltip';

const ButtonInRow = function ({ label, icon, tooltip, onClick, disabled, width }) {
  return (
    <RaisedButton
      primary
      style={width ? { width } : {margin: '0 5px'}}
      onClick={onClick}
      disabled={disabled}
    >
      <div style={{padding: width ? 0 : '0 10px'}}>
        <Tooltip inline text={tooltip}>
          <FontIcon className="material-icons" style={{verticalAlign: 'middle', color: 'white'}}>
            {icon}
          </FontIcon>
          <span style={{
            fontSize: 14,
            textTransform: 'uppercase',
            fontWeight: '500',
            userSelect: 'none',
            paddingLeft: 8,
            paddingRight: 8,
            color: 'white'
          }}>
            {label}
          </span>
        </Tooltip>
      </div>
    </RaisedButton>
  );
};

ButtonInRow.propTypes = {
  label: string,
  icon: string,
  tooltip: string,
  onClick: func,
  disabled: bool,
  width: string  // When width isn't explicitly set, apply margin and padding to make the button look good.
};

ButtonInRow.defaultProps = {
  disabled: false
};

export default ButtonInRow;
