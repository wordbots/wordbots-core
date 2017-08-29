import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';

import {isFlagSet} from '../util/browser';
import Tooltip from '../components/Tooltip';

export default class NavMenu extends Component {
  get isExpanded () {
    return !isFlagSet('sidebarCollapsed');
  }

  renderIcon = icon => (
    <FontIcon
      className="material-icons"
      style={{
        left: this.isExpanded ? 4 : 8
      }}
    >
      {icon}
    </FontIcon>
  );

  renderLink = (path, text, icon) => (
    <NavLink exact to={path} activeClassName="activeNavLink">
      <Tooltip
        disable={this.isExpanded}
        text={text}
        place="right"
        style={{
          zIndex: 99999
        }}
      >
        <MenuItem primaryText={this.isExpanded ? text : ''} leftIcon={this.renderIcon(icon)} />
      </Tooltip>
    </NavLink>
  );

  render () {
    return (
      <Drawer
        open
        containerStyle={{
          top: 54,
          paddingTop: 10,
          width: this.isExpanded ? 256 : 64,
          transition: 'width 200ms ease-in-out',
          height: 'calc(100% - 54px)',
          overflow: 'visible'
        }}
      >
        {this.renderLink('/', 'Home', 'home')}
        {this.renderLink('/collection', 'Collection', 'view_module')}
        {this.renderLink('/creator', 'Creator', 'add_circle_outline')}
        {this.renderLink('/decks', 'Decks', 'view_list')}
        {this.renderLink('/play', 'Play', 'videogame_asset')}
        {this.renderLink('/about', 'About', 'info_outline')}
      </Drawer>
    );
  }
}
