import Icon from '@material-ui/core/Icon';
import BuildIcon from '@material-ui/icons/Build';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import HomeIcon from '@material-ui/icons/Home';
import InfoOutlineIcon from '@material-ui/icons/InfoOutlined';
import LayersIcon from '@material-ui/icons/Layers';
import PeopleIcon from '@material-ui/icons/People';
import ViewListIcon from '@material-ui/icons/ViewList';
import ViewModuleIcon from '@material-ui/icons/ViewModule';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { HEADER_HEIGHT, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_Y_OFFSET, SIDEBAR_Z_INDEX, UNSUPPORTED_BROWSER_MESSAGE_HEIGHT } from '../constants';

import NavMenuLink from './NavMenuLink';

interface NavMenuProps {
  cardIdBeingEdited: string | null
  isUnsupportedBrowser: boolean
}

class NavMenu extends React.PureComponent<NavMenuProps & RouteComponentProps> {
  public render(): JSX.Element {
    const { cardIdBeingEdited, isUnsupportedBrowser, history: { location } } = this.props;

    const iconStyle = {
      transform: 'skewY(-20deg)',
      marginRight: 15
    };

    return (
      <div
        style={{
          position: 'fixed',
          display: 'flex',
          flexDirection: 'column',
          top: HEADER_HEIGHT + (isUnsupportedBrowser ? UNSUPPORTED_BROWSER_MESSAGE_HEIGHT : 0) + SIDEBAR_Y_OFFSET,
          zIndex: SIDEBAR_Z_INDEX,
          width: SIDEBAR_COLLAPSED_WIDTH
        }}
      >
        <NavMenuLink location={location} path="/" text="Home" icon={<HomeIcon style={iconStyle} />} />
        <NavMenuLink location={location} path="/play" text="Arena" icon={<Icon className={`ra ra-crossed-swords`} style={{ ...iconStyle, lineHeight: 1.2 }} />} />
        <NavMenuLink location={location} path={`/card/${cardIdBeingEdited || "new"}`} text="Workshop" icon={<BuildIcon style={iconStyle} />} />
        <NavMenuLink location={location} path="/collection" text="Collection" icon={<ViewModuleIcon style={iconStyle} />} />
        <NavMenuLink location={location} path="/decks" text="Decks" icon={<ViewListIcon style={iconStyle} />} />
        <NavMenuLink location={location} path="/sets" text="Sets" icon={<LayersIcon style={iconStyle} />} />
        <NavMenuLink location={location} path="/community" text="Community" icon={<PeopleIcon style={iconStyle} />} />
        <NavMenuLink location={location} path="/help" text="Help" icon={<HelpOutlineIcon style={iconStyle} />} />
        <NavMenuLink location={location} path="/about" text= "About" icon={<InfoOutlineIcon style={iconStyle} />} />
      </div>
    );
  }
}

export default withRouter(NavMenu);
