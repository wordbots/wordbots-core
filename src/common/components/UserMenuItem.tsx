import Icon from '@material-ui/core/Icon';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import { red } from '@material-ui/core/colors';
import * as React from 'react';

interface UserMenuItemProps {
  icon: string
  text: string
  onClick: () => void
}

export default class UserMenuItem extends React.PureComponent<UserMenuItemProps> {
  public render(): JSX.Element {
    const { icon, text, onClick } = this.props;

    return (
      <MenuItem
        onClick={onClick}
        style={{
          marginTop: -1,
          border: `1px solid ${red[500]}`,
          borderRight: 0,
          boxShadow: '1px 1px 5px #6666',
        }}
      >
        <ListItemIcon>
          <Icon className="material-icons">{icon}</Icon>
        </ListItemIcon>
        <ListItemText
          style={{ padding: '0 8px' }}
          primaryTypographyProps={{
            style: { fontFamily: '"Carter One"', color: '#666', textTransform: 'uppercase' }
          }}
        >
          {text}
        </ListItemText>
      </MenuItem>
    );
  }
}
