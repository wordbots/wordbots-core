import { Button, Icon } from '@material-ui/core';
import * as React from 'react';

import Tooltip from '../Tooltip';

interface CreatorToolbarButtonProps {
  icon: string
  tooltip: string
  children: string
  onClick: () => void
  disabled?: boolean
}

/* eslint-disable react/no-multi-comp */
const CreatorToolbarButton: React.SFC<CreatorToolbarButtonProps> = (props: CreatorToolbarButtonProps) => {
  const { icon, tooltip, children, onClick, disabled } = props;
  return (
    <Tooltip inline text={tooltip} place="bottom" style={{ textTransform: 'none' }}>
      <Button
        color="secondary"
        variant="contained"
        disabled={!!disabled}
        style={{ marginLeft: 10, marginTop: 9 }}
        onClick={onClick}
      >
        <Icon style={{ marginRight: 10 }} className="material-icons">{icon}</Icon>
          {children}
      </Button>
    </Tooltip>
  );
};

export default CreatorToolbarButton;
