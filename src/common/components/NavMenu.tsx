import { withStyles, WithStyles } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import Icon from '@material-ui/core/Icon';
import MenuItem from '@material-ui/core/MenuItem';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { MAX_Z_INDEX, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH, SIDEBAR_Z_INDEX } from '../constants';
import { isFlagSet, isSupportedBrowser, toggleFlag } from '../util/browser';

import Tooltip from './Tooltip';

interface NavMenuProps {
  canExpand: boolean
  isExpanded: boolean
  cardIdBeingEdited: string | null
  onRerender: () => void
}

class NavMenu extends React.Component<NavMenuProps & WithStyles> {
  public static styles: Record<string, CSSProperties> = {
    drawerPaper: {
      top: 54,
      paddingTop: 10,
      transition: 'width 200ms ease-in-out',
      height: 'calc(100% - 54px)',
      overflow: 'visible',
      zIndex: SIDEBAR_Z_INDEX,
      '& .material-icons': {
        color: '#666'
      },
      '& li .material-icons': {
        marginRight: 20
      }
    },
    expanded: {
      width: SIDEBAR_WIDTH
    },
    collapsed: {
      width: SIDEBAR_COLLAPSED_WIDTH
    },
    unsupportedBrowser: {
      top: 54 + 50
    }
  };

  public render(): JSX.Element {
    const { canExpand, cardIdBeingEdited, isExpanded, classes } = this.props;
    return (
      <Drawer
        open
        variant="permanent"
        classes={{ paper: `${classes.drawerPaper} ${isExpanded ? classes.expanded : classes.collapsed} ${!isSupportedBrowser() && classes.unsupportedBrowser}` }}
      >
        {this.renderLink('/', 'Home', 'home')}
        {this.renderLink('/play', 'Arena', 'crossed-swords', 'ra')}
        {this.renderLink(`/card/${cardIdBeingEdited || 'new'}`, 'Workshop', 'build')}
        {this.renderLink('/collection', 'Collection', 'view_module')}
        {this.renderLink('/decks', 'Decks', 'view_list')}
        {this.renderLink('/sets', 'Sets', 'layers')}
        {this.renderLink('/community', 'Community', 'people')}
        {this.renderLink('/help', 'Help', 'help_outline')}
        {this.renderLink('/about', 'About', 'info_outline')}
        {canExpand && this.renderExpandCollapseButton()}
      </Drawer>
    );
  }

  private toggleExpanded = () => {
    toggleFlag('sidebarCollapsed');
    this.props.onRerender();
  }

  private renderIcon = (icon: string, iconFont: 'material' | 'ra'): React.ReactNode => {
    if (iconFont === 'material') {
      return (
        <Icon
          className="material-icons"
          style={{ left: this.props.isExpanded ? 4 : 8 }}
        >
          {icon}
        </Icon>
      );
    } else if (iconFont === 'ra') {
      return (
        <Icon
          className={`ra ra-${icon}`}
          style={{
            left: this.props.isExpanded ? 4 : 8,
            lineHeight: 1.2
          }}
        />
      );
    }
  }

  private renderLink = (path: string, text: string, icon: string, iconFont: 'material' | 'ra' = 'material') => (
    <NavLink exact to={path} activeClassName="activeNavLink">
      <Tooltip
        disable={this.props.isExpanded}
        text={text}
        place="right"
        style={{ zIndex: MAX_Z_INDEX }}
      >
        <MenuItem>
          {this.renderIcon(icon, iconFont)}
          {this.props.isExpanded ? text : ''}
        </MenuItem>
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
        {this.props.isExpanded
          ? <React.Fragment>
              <Icon className="material-icons" style={{ fontSize: '0.6em' }}>arrow_forward</Icon>
              <Icon className="material-icons" style={{ fontSize: '0.6em' }}>arrow_back</Icon>
            </React.Fragment>
          : <React.Fragment>
              <Icon className="material-icons" style={{ fontSize: '0.6em' }}>arrow_back</Icon>
              <Icon className="material-icons" style={{ fontSize: '0.6em' }}>arrow_forward</Icon>
            </React.Fragment>
        }
      </Tooltip>
    </div>
  )
}

export default withStyles(NavMenu.styles)(NavMenu);
