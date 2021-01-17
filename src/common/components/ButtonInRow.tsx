import Button from '@material-ui/core/Button';
import FontIcon from 'material-ui/FontIcon';
import * as React from 'react';

import Tooltip from './Tooltip';

interface ButtonInRowProps {
  label: string
  icon: string
  tooltip: string
  onClick: (e: React.MouseEvent<HTMLElement>) => void
  disabled?: boolean
  width?: string
}

export default class ButtonInRow extends React.PureComponent<ButtonInRowProps> {
  public render(): JSX.Element {
    const { label, icon, tooltip, onClick, disabled, width } = this.props;
    return (
      <Button
        variant="contained"
        color="secondary"
        className="button-in-row"
        style={width ? { width, padding: '5px 0' } : { margin: '0 5px', padding: '0 10px' }}
        onClick={onClick}
        disabled={disabled}
      >
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
      </Button>
    );
  }
}
