import { withStyles, WithStyles } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import * as React from 'react';

import { HEADER_HEIGHT, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_Z_INDEX, UNSUPPORTED_BROWSER_MESSAGE_HEIGHT } from '../constants';
import { isSupportedBrowser } from '../util/browser';

import NavMenuLink from './NavMenuLink';

interface NavMenuProps {
  cardIdBeingEdited: string | null
}

class NavMenu extends React.Component<NavMenuProps & WithStyles> {
  public static styles: Record<string, CSSProperties> = {
    drawerPaper: {
      top: HEADER_HEIGHT,
      height: 'calc(100% - 54px)',
      overflow: 'visible',
      zIndex: SIDEBAR_Z_INDEX,
      width: SIDEBAR_COLLAPSED_WIDTH,
      background: 'transparent',
      border: 0,
      paddingTop: 10,
      '& .material-icons': {
        color: '#666'
      },
      '& li .material-icons': {
        marginRight: 20
      }
    },
    unsupportedBrowser: {
      top: HEADER_HEIGHT + UNSUPPORTED_BROWSER_MESSAGE_HEIGHT
    }
  };

  public render(): JSX.Element {
    const { cardIdBeingEdited, classes } = this.props;
    return (
      <Drawer
        open
        variant="permanent"
        classes={{ paper: `${classes.drawerPaper} ${!isSupportedBrowser() && classes.unsupportedBrowser}` }}
      >
        <NavMenuLink path="/" text="Home" icon="home" />
        <NavMenuLink path="/play" text="Arena" icon="crossed-swords" iconFont="ra" />
        <NavMenuLink path={`/card/${cardIdBeingEdited || "new"}`} text="Workshop" icon="build" />
        <NavMenuLink path="/collection" text="Collection" icon="view_module" />
        <NavMenuLink path="/decks" text="Decks" icon="view_list" />
        <NavMenuLink path="/sets" text="Sets" icon="layers" />
        <NavMenuLink path="/community" text="Community" icon="people" />
        <NavMenuLink path="/help" text="Help" icon="help_outline" />
        <NavMenuLink path="/about" text= "About" icon="info_outline" />
      </Drawer>
    );
  }
}

export default withStyles(NavMenu.styles)(NavMenu);
