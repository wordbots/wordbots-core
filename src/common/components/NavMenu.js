import React, { Component } from 'react';
import { bool, object } from 'prop-types';
import { NavLink } from 'react-router-dom';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';

import { logout } from '../util/firebase';

export default class NavMenu extends Component {
  static propTypes = {
    open: bool,
    user: object
  };

  renderLink(path, text, icon) {
    return (
      <NavLink exact to={path} activeClassName="activeNavLink">
        <MenuItem primaryText={text} leftIcon={
          <FontIcon className="material-icons">{icon}</FontIcon>
        }/>
      </NavLink>
    );
  }

  renderLogoutButton() {
    return (
      <MenuItem
        primaryText={'Logout'}
        onClick={logout}
        leftIcon={<FontIcon className="material-icons">person</FontIcon>}/>
    );
  }

  render() {
    return (
      <Drawer
        open={this.props.open}
        containerStyle={{
          top: 54,
          paddingTop: 10
      }}>
        {this.renderLink('/', 'Home', 'home')}
        {this.renderLink('/collection', 'Collection', 'view_module')}
        {this.renderLink('/creator', 'Creator', 'add_circle_outline')}
        {this.renderLink('/decks', 'Decks', 'view_list')}
        {this.renderLink('/play', 'Play', 'videogame_asset')}
        {this.props.user && this.renderLogoutButton()}
      </Drawer>
    );
  }
}
