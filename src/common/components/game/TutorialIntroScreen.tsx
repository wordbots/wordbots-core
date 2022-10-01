import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import * as React from 'react';

import { TUTORIAL_INTRO_Z_INDEX } from '../../../common/constants';

interface TutorialIntroScreenProps {
  onClickEndGame: () => void
}

interface TutorialIntroScreenState {
  open: boolean
}

class TutorialIntroScreen extends React.Component<TutorialIntroScreenProps & WithStyles, TutorialIntroScreenState> {
  public static styles: Record<string, CSSProperties> = {
    modal: {
      zIndex: TUTORIAL_INTRO_Z_INDEX
    }
  };

  public state = {
    open: true
  };

  public render(): JSX.Element {
    return (
      <Dialog
        open={this.state.open}
        className={this.props.classes.modal}
      >
        <DialogTitle>Wordbots Gameplay Tutorial</DialogTitle>
        <DialogContent>
          <p>Welcome to the Wordbots Tutorial!</p>
          <p>This tutorial should take just 5 minutes to complete and will teach you all the basic gameplay mechanics required to play the game of Wordbots, including how to place robots onto the board, how to play action cards to tilt the game in your favor, and the basic steps that go into each turn.</p>
          <p>When prompted, hit the <b>Next</b> button to continue to the next step. To leave at any point during the tutorial hit the <b>Forfeit</b> (🏳️) button.</p>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={this.handleGoBack}>
            Go Back
          </Button>
          <Button variant="outlined" onClick={this.handleContinue} autoFocus>
            Next
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  private handleGoBack = () => {
    this.setState({ open: false });
    this.props.onClickEndGame();
  }

  private handleContinue = () => {
    this.setState({ open: false });
  }
}

export default withStyles(TutorialIntroScreen.styles)(TutorialIntroScreen);
