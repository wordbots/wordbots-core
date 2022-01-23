import { Button, Icon } from '@material-ui/core';
import * as React from 'react';

import Tooltip from './Tooltip';

interface ToolbarButtonProps {
  icon: string | null
  children: string
  onClick: () => void
  vertical?: boolean
  disabled?: boolean
  tooltip?: string
  color?: 'primary' | 'secondary' // defaults to 'primary'
}

const ToolbarButton: React.SFC<ToolbarButtonProps> = (props: ToolbarButtonProps) => {
  const { icon, tooltip, children, onClick, vertical, disabled, color } = props;
  return (
    <Tooltip
      inline
      text={tooltip || ''}
      disable={!tooltip}
      place="bottom"
      style={{ textTransform: 'none' }}
    >
      <Button
        variant="contained"
        color={color || 'secondary'}
        disabled={!!disabled}
        style={{
          ...(vertical ? { width: '100%', height: 48, marginTop: 10 } : { marginLeft: 10, marginTop: 9 }),
          ...(disabled ? { border: '0.5px solid #aaa' } : {})
        }}
        onClick={onClick}
      >
        {icon && <Icon
          className="material-icons"
          style={vertical ? { margin: '0 20px' } : { marginRight: 10 }}
        >
          {icon}
        </Icon>}
        {children}
      </Button>
    </Tooltip>
  );
};

export default ToolbarButton;
