import { withStyles, WithStyles } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import FontIcon from 'material-ui/FontIcon';
import { red500 } from 'material-ui/styles/colors';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

interface NewHereLinkProps {
  idx: number
  accomplished?: boolean
  href?: string
  children: string
}

class NewHereLink extends React.Component<NewHereLinkProps & RouteComponentProps & WithStyles> {
  public static styles: Record<string, CSSProperties> = {
    container: {
      position: 'relative',
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
    accomplished: {
      background: 'repeating-linear-gradient(45deg, #ffffff, #ffffff 10px, #ffdbd9 10px, #ffdbd9 20px);'
    },
    checkmark: {
      top: 10,
      right: 10,
      color: '#f44336 !important',
      ':hover > &': {
        color: 'white !important',
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
    const { classes, accomplished, href, idx, children: text } = this.props;
    return (
      <div
        className={`${classes.container} ${accomplished && classes.accomplished}`}
        style={{ cursor: href ? 'pointer' : 'default' }}
        onClick={this.followLink}
      >
        <div className={classes.number}>{idx}</div>
        <div className={classes.text}>{text}</div>
        {
          accomplished &&
            <FontIcon className={`material-icons ${classes.checkmark}`} style={{ position: 'absolute' }}>
              check_circle
            </FontIcon>
        }
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
