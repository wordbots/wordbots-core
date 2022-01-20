import { Icon } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import { red } from '@material-ui/core/colors';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { MAX_Z_INDEX } from '../constants';

interface NavMenuLinkProps {
  path: string
  text: string
  icon: string
  iconFont?: 'material' | 'ra'
}

interface NavMenuLinkState {
  isHovered: boolean
}

class NavMenuLink extends React.Component<NavMenuLinkProps, NavMenuLinkState> {
  public state = {
    isHovered: false
  };

  public render(): JSX.Element {
    const { path, text, icon, iconFont } = this.props;
    const { isHovered } = this.state;

    return (
      <NavLink
        exact
        to={path}
        activeClassName="activeNavLink"
        style={{
          transform: `skewY(20deg)`,
          transformOrigin: '0% 0%',
          width: isHovered ? 168 : 64,
          border: `1px solid ${red[500]}`,
          borderLeftWidth: 0,
          marginBottom: 5,
          background: 'white',
          zIndex: MAX_Z_INDEX,
          transition: 'width 100ms ease-in-out',
          boxShadow: '1px 1px 5px #666b'
        }}
      >
        <MenuItem onMouseOver={this.onHover} onMouseLeave={this.onUnhover}>
          {this.renderIcon(icon, iconFont || 'material')}
          {this.state.isHovered &&
            <span style={{ fontFamily: '"Carter One"', textTransform: 'uppercase', color: '#666' }}>
              {text}
            </span>
          }
        </MenuItem>
      </NavLink>
    );
  }

  private onHover = () => { this.setState({ isHovered: true }); };
  private onUnhover = () => { this.setState({ isHovered: false }); };

  private renderIcon = (icon: string, iconFont: 'material' | 'ra'): React.ReactNode => {
    if (iconFont === 'material') {
      return (
        <Icon
          className="material-icons"
          style={{
            left: 8,
            transform: 'skewY(-20deg)'
          }}
        >
          {icon}
        </Icon>
      );
    } else if (iconFont === 'ra') {
      return (
        <Icon
          className={`ra ra-${icon}`}
          style={{
            left: 8,
            lineHeight: 1.2,
            transform: 'skewY(-20deg)'
          }}
        />
      );
    }
  }
}

export default NavMenuLink;
