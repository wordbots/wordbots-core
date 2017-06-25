import React, { Component } from 'react';
import { bool } from 'prop-types';
import { NavLink } from 'react-router-dom';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';

import Tooltip from '../components/Tooltip';

export default class NavMenu extends Component {
  static propTypes = {
    open: bool
  };

  renderLink(path, text, icon) {
    const iconStyle = {
      left: this.props.open ? 4 : 8
    };
    const tooltipStyle = {
      zIndex: 99999
    };

    return (
      <NavLink exact to={path} activeClassName="activeNavLink">
        <Tooltip disable={this.props.open} text={text} style={tooltipStyle}>
          <MenuItem primaryText={this.props.open ? text : ''} leftIcon={
            <FontIcon className="material-icons" style={iconStyle}>{icon}</FontIcon>
          }/>
        </Tooltip>
      </NavLink>
    );
  }

  render() {
    return (
      <Drawer
        open
        containerStyle={{
          top: 54,
          paddingTop: 10,
          width: this.props.open ? 256 : 64,
          transition: 'width 200ms ease-in-out',
          height: 'calc(100% - 54px)',
          overflow: 'visible'
      }}>
        {this.renderLink('/', 'Home', 'home')}
        {this.renderLink('/collection', 'Collection', 'view_module')}
        {this.renderLink('/creator', 'Creator', 'add_circle_outline')}
        {this.renderLink('/decks', 'Decks', 'view_list')}
        {this.renderLink('/play', 'Play', 'videogame_asset')}
      </Drawer>
    );
  }
}
