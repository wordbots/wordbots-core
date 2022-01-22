import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import CloseIcon from '@material-ui/icons/Close';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import * as React from 'react';

import Tooltip from '../components/Tooltip';
import { isFlagSet, toggleFlag } from '../util/browser';

interface PageHelpProps {
  children: JSX.Element
  flagSuffix: string
  openByDefault?: true
}

interface PageHelpState {
  isOpen: boolean
}

class PageHelp extends React.Component<PageHelpProps & WithStyles, PageHelpState> {
  public static styles: Record<string, CSSProperties> = {
    openButton: {
      float: 'right',
      top: 10,
      right: 10
    },
    closeButton: {
      float: 'right',
      top: -8,
      right: -8
    },
    container: {
      display: 'inline'
    },
    helpPaper: {
      float: 'right',
      marginTop: 10,
      marginRight: 10,
      maxWidth: 700,
      padding: 10,
      '& p': {
        marginTop: 0
      },
      '& p:last-child': {
        marginBottom: 0
      }
    }
  };

  public showHelpTextFlag = `wb$showHelpText$${this.props.flagSuffix}`;

  public state = {
    isOpen: isFlagSet(this.showHelpTextFlag, this.props.openByDefault || false)
  }

  public render(): JSX.Element {
    const { children, classes } = this.props;
    const { isOpen } = this.state;

    return (
      <div className={classes.container}>
        {
          isOpen
            ? <div className={classes.container}>
                <Paper className={classes.helpPaper}>
                  <IconButton className={classes.closeButton} onClick={this.handleHideHelpText}>
                    <CloseIcon />
                  </IconButton>
                  {children}
                </Paper>
                <div style={{clear: 'both'}} />
              </div>
            : <Tooltip inline place="right" text="Click to show help text for this page.">
                <IconButton className={classes.openButton} onClick={this.handleShowHelpText}>
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
        }
      </div>
    );
  }

  private handleShowHelpText = () => {
    toggleFlag(this.showHelpTextFlag, true);
    this.setState({ isOpen: true });
  }

  private handleHideHelpText = () => {
    toggleFlag(this.showHelpTextFlag, false);
    this.setState({ isOpen: false });
  }
}

export default withStyles(PageHelp.styles)(PageHelp);
