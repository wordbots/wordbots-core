import { withStyles, WithStyles } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { red500 } from 'material-ui/styles/colors';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

interface NewHereLinkProps {
  idx: number
  href?: string
  children: string
}

class NewHereLink extends React.Component<NewHereLinkProps & RouteComponentProps & WithStyles> {
  public static styles: Record<string, CSSProperties> = {
    container: {
      height: 130,
      border: '1px solid black',
      margin: 2,
      padding: 5,
      '&:hover': {
        background: red500,
        borderColor: red500,
        color: '#eee',
      }
    },
    number: {
      fontFamily: 'Carter One',
      fontSize: '2em',
      color: '#f44336',
      WebkitTextStroke: '0.5px black',
      marginBottom: -5,
      ':hover > &': {
        color: 'white',
        WebkitTextStroke: 0,
      }
    },
    text: {
      textAlign: 'center',
      fontSize: '0.95em'
    }
  };

  public render(): JSX.Element {
    const { classes, href, idx, children: text } = this.props;
    return (
      <div
        className={classes.container}
        style={{ cursor: href ? 'pointer' : 'default' }}
        onClick={this.followLink}
      >
        <div className={classes.number}>{idx}</div>
        <div className={classes.text}>{text}</div>
      </div>
    );
  }

  private followLink = () => {
    const { href, history } = this.props;
    if (href) {
      history.push(href);
    }
  }
}

export default withStyles(NewHereLink.styles)(withRouter(NewHereLink));
