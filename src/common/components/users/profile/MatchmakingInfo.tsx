import { withStyles, WithStyles } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import * as React from 'react';

import Title from '../../Title';

const styles: Record<string, CSSProperties> = {
  root: {
    width: '100%',
    height: '100%'
  },
  comingSoon: {
    width: '100%',
    height: 'calc(100% - 35px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 36,
    fontWeight: 100
  }
};

// eslint-disable-next-line react/prefer-stateless-function
class MatchmakingInfo extends React.Component<WithStyles> {
  public render(): JSX.Element {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Title text="Matchmaking" small />
        <div className={classes.comingSoon}>COMING SOON</div>
      </div>
    );
  }
}

export default withStyles(styles)(MatchmakingInfo);
