import Drawer from 'material-ui/Drawer';
import FontIcon from 'material-ui/FontIcon';
import MenuItem from 'material-ui/MenuItem';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { MAX_Z_INDEX, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH, SIDEBAR_Z_INDEX } from '../constants';
import { isFlagSet, toggleFlag, zeroWidthJoin } from '../util/browser';

import Tooltip from './Tooltip';

interface NavMenuProps {
  onRerender: () => void
}

export default class NavMenu extends React.Component<NavMenuProps> {
  get isExpanded(): boolean {
    return !isFlagSet('sidebarCollapsed');
  }

  public render(): JSX.Element {
    return (
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
        }}
      >
        {this.renderLink('/', 'Home', 'home')}
        {this.renderLink('/collection', 'Collection', 'view_module')}
        {this.renderLink('/card/new', 'Creator', 'add_circle_outline')}
        {this.renderLink('/decks', 'Decks', 'view_list')}
        {this.renderLink('/sets', 'Sets', 'layers')}
        {this.renderLink('/play', 'Play', 'videogame_asset')}
        {this.renderLink('/about', 'About', 'info_outline')}
        {this.renderExpandCollapseButton()}
      </Drawer>
    );
  }

  private toggleExpanded = () => {
    toggleFlag('sidebarCollapsed');
    this.props.onRerender();
  }

  private renderIcon = (icon: string) => (
    <FontIcon
      className="material-icons"
      style={{
        left: this.isExpanded ? 4 : 8
      }}
    >
      {icon}
    </FontIcon>
  )

  private renderLink = (path: string, text: string, icon: string) => (
    <NavLink exact to={path} activeClassName="activeNavLink">
      <Tooltip
        disable={this.isExpanded}
        text={text}
        place="right"
        style={{
          zIndex: MAX_Z_INDEX
        }}
      >
        <MenuItem
          primaryText={this.isExpanded ? text : ''}
          leftIcon={this.renderIcon(icon)}
        />
      </Tooltip>
    </NavLink>
  )

  private renderExpandCollapseButton = () => (
    <div
      onClick={this.toggleExpanded}
      style={{
        textAlign: 'center',
        cursor: 'pointer'
      }}
    >
      <Tooltip
        text={isFlagSet('sidebarCollapsed') ? 'Expand' : 'Collapse'}
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
    </div>
  )
}
