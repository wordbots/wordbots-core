import * as React from 'react';
import { func } from 'prop-types';
import { NavLink } from 'react-router-dom';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';

import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_Z_INDEX } from '../constants.ts';
import { isFlagSet, toggleFlag, zeroWidthJoin } from '../util/browser.tsx';
import Tooltip from '../components/Tooltip';

export default class NavMenu extends React.Component {
  static propTypes = {
    onRerender: func
  }

  get isExpanded() {
    return !isFlagSet('sidebarCollapsed');
  }

  toggleExpanded = () => {
    toggleFlag('sidebarCollapsed');
    this.props.onRerender();
  }

  renderIcon = (icon) => (
    <FontIcon
      className="material-icons"
      style={{
        left: this.isExpanded ? 4 : 8
    }}>
      {icon}
    </FontIcon>
  )

  renderLink = (path, text, icon) => (
    <NavLink exact to={path} activeClassName="activeNavLink">
      <Tooltip
        disable={this.isExpanded}
        text={text}
        place="right"
        style={{
          zIndex: 99999
      }}>
        <MenuItem
          primaryText={this.isExpanded ? text : ''}
          leftIcon={this.renderIcon(icon)} />
      </Tooltip>
    </NavLink>
  )

  renderExpandCollapseButton = () =>
    <div
      onClick={this.toggleExpanded}
      style={{
        textAlign: 'center',
        cursor: 'pointer'
      }}
    >
      <Tooltip
        text={isFlagSet('sidebarCollapsed') ? 'Expand' : 'Collapse' }
        place="right"
      >
        <FontIcon
          className="material-icons"
          style={{
            fontSize: '0.6em',
            color: '#666'
          }}
        >
          <span>
            {this.isExpanded ? zeroWidthJoin('arrow_forward', 'arrow_back') : zeroWidthJoin('arrow_back', 'arrow_forward')}
          </span>
        </FontIcon>
      </Tooltip>
    </div>;

  render = () =>
    <Drawer
      open
      containerStyle={{
        top: 54,
        paddingTop: 10,
        width: this.isExpanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
        transition: 'width 200ms ease-in-out',
        height: 'calc(100% - 54px)',
        overflow: 'visible',
        zIndex: SIDEBAR_Z_INDEX
    }}>
      {this.renderLink('/', 'Home', 'home')}
      {this.renderLink('/collection', 'Collection', 'view_module')}
      {this.renderLink('/creator', 'Creator', 'add_circle_outline')}
      {this.renderLink('/decks', 'Decks', 'view_list')}
      {this.renderLink('/sets', 'Sets', 'layers')}
      {this.renderLink('/singleplayer', 'Singleplayer', 'videogame_asset')}
      {this.renderLink('/multiplayer', 'Multiplayer', 'supervised_user_circle')}
      {this.renderLink('/about', 'About', 'info_outline')}
      {this.renderExpandCollapseButton()}
    </Drawer>;
}
