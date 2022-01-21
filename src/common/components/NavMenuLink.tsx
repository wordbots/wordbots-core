import MenuItem from '@material-ui/core/MenuItem';
import { red } from '@material-ui/core/colors';
import { Location } from 'history';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { MAX_Z_INDEX } from '../constants';

interface NavMenuLinkProps {
  path: string
  text: string
  icon: JSX.Element
  location: Location
}

interface NavMenuLinkState {
  isHovered: boolean
}

class NavMenuLink extends React.Component<NavMenuLinkProps, NavMenuLinkState> {
  public state = {
    isHovered: false
  };

  public render(): JSX.Element {
    const { path, text, icon, location } = this.props;
    const { isHovered } = this.state;

    const isActive: boolean = (
      path === '/'
        ? (location.pathname === '/' || location.pathname.startsWith('/home'))
        : location.pathname.startsWith(path)
    );

    return (
      <NavLink
        to={path}
        style={{
          transform: `skewY(20deg)`,
          transformOrigin: '0% 0%',
          width: isHovered ? 168 : 58,
          border: `1px solid ${red[500]}`,
          borderLeftWidth: isActive ? 4 : 0,
          backgroundColor: isActive ? '#eee' : 'default',
          marginBottom: 5,
          background: 'white',
          zIndex: MAX_Z_INDEX,
          transition: 'width 100ms ease-in-out',
          boxShadow: '1px 1px 5px #666b',
        }}
      >
        <MenuItem onMouseOver={this.onHover} onMouseLeave={this.onUnhover}>
          {icon}
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
}

export default NavMenuLink;
