import React, { Component } from 'react';
import { bool } from 'prop-types';
import { NavLink } from 'react-router-dom';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';

import { logout } from '../util/firebase';

export default class NavMenu extends Component {
  static propTypes = {
    open: bool,
    loggedIn: bool
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

  render() {
    const containerStyle = {top: 54, paddingTop: 10};

    if (this.props.loggedIn) {
      return (
        <Drawer open={this.props.open} containerStyle={containerStyle}>
          {this.renderLink('/', 'Home', 'home')}
          {this.renderLink('/collection', 'Collection', 'recent_actors')}
          {this.renderLink('/creator', 'Creator', 'add_circle_outline')}
          {this.renderLink('/decks', 'Decks', 'view_list')}
          {this.renderLink('/play', 'Play', 'videogame_asset')}
          <MenuItem
            primaryText="Logout"
            onClick={logout}
            leftIcon={<FontIcon className="material-icons">person</FontIcon>}/>
        </Drawer>
      );
    } else {
      return (
        <Drawer open={this.props.open} containerStyle={containerStyle}>
          {this.renderLink('/', 'Home', 'home')}
          {this.renderLink('/login', 'Login', 'person')}
          {this.renderLink('/register', 'Register', 'person_add')}
          {this.renderLink('/collection', 'Collection', 'recent_actors')}
          {this.renderLink('/creator', 'Creator', 'add_circle_outline')}
          {this.renderLink('/decks', 'Decks', 'view_list')}
          {this.renderLink('/play', 'Play', 'videogame_asset')}
        </Drawer>
      );
    }
  }
}
