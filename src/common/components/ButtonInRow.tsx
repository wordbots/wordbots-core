import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import * as React from 'react';

import Tooltip from './Tooltip';

interface ButtonInRowProps {
  label: string
  icon: string
  tooltip: string
  onClick: (e: React.MouseEvent<any>) => void
  disabled?: boolean
  width?: string
}

export default class ButtonInRow extends React.Component<ButtonInRowProps> {
  public render(): JSX.Element {
    const { label, icon, tooltip, onClick, disabled, width } = this.props;
    return (
      <RaisedButton
        primary
        className="button-in-row"
        style={width ? { width } : {margin: '0 5px'}}
        onClick={onClick}
        disabled={disabled}
      >
        <div style={{padding: width ? 0 : '0 10px'}}>
          <Tooltip inline text={tooltip} disable={disabled}>
            <FontIcon className="material-icons" style={{verticalAlign: 'middle', color: 'white'}}>
              {icon}
            </FontIcon>
            <span
              style={{
                fontSize: 14,
                textTransform: 'uppercase',
                fontWeight: 500,
                userSelect: 'none',
                paddingLeft: 8,
                paddingRight: 8,
                color: 'white',
                wordBreak: 'break-all',
                hyphens: 'auto'
              }}
            >
              {label}
            </span>
          </Tooltip>
        </div>
      </RaisedButton>
    );
  }
}
