import * as React from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';
import { Paper, withStyles, WithStyles, Button, Dialog, DialogActions, DialogContent } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import * as fb from 'firebase';
import { isUndefined } from 'lodash';

import * as w from '../../types';
import Card from '../card/Card';
import MustBeLoggedIn from '../users/MustBeLoggedIn';

interface SetSummaryBaseProps {
  set: w.Set
  user: fb.User | null
  numDecksCreated?: number
  onCreateDeckFromSet: () => void
  onDeleteSet: () => void
  onEditSet: () => void
  onPublishSet: () => void
}

interface SetSummaryState {
  isCardListExpanded: boolean,
  isPermalinkCopied: boolean,
  isPublishConfirmDialogOpen: boolean
}

type SetSummaryProps = SetSummaryBaseProps & WithStyles;

class SetSummaryCard extends React.Component<{ card: w.CardInStore, waitMs?: number }, { visible: boolean }> {
  public state = { visible: false };

  public componentWillMount(): void {
    // https://stackoverflow.com/a/30807560/2608804
    setTimeout(() => {
      this.setState({ visible: true });
    }, this.props.waitMs || 0);
  }

  public render(): React.ReactNode {
    return this.state.visible && <div style={{float: 'left'}}>
      {Card.fromObj(this.props.card, { scale: 0.7 })}
    </div>;
  }
}

class SetSummary extends React.Component<SetSummaryProps, SetSummaryState> {
  public static styles: Record<string, CSSProperties> = {
    paper: {
      position: 'relative',
      padding: 10,
      marginBottom: 5
    },
    controls: {
      position: 'absolute',
      top: 5,
      right: 8
    },
    controlsButton: {
      minHeight: 0,
      minWidth: 60,
      marginLeft: 5,
      padding: '4px 8px'
    },
    dialogButton: {
      marginLeft: 10
    },
    bottomLink: {
      cursor: 'pointer',
      textDecoration: 'underline',
      '&:hover': {
        textDecoration: 'none'
      }
    },
    numDecksCreated: {
      position: 'absolute',
      right: 8,
      bottom: 5,
      fontStyle: 'italic',
      color: '#666',
      fontSize: '0.75em'
    }
  };

  public state = {
    isCardListExpanded: false,
    isPermalinkCopied: false,
    isPublishConfirmDialogOpen: false
  };

  get doesSetBelongToUser(): boolean {
    const { set, user } = this.props;
    return user ? set.metadata.authorId === user.uid : false;
  }

  get permalinkUrl(): string {
    const { set } = this.props;
    return `${window.location.href.split('?')[0]}?set=${set.id}`;
  }

  public render(): JSX.Element {
    const {
      classes,
      set: { cards, description, metadata, name },
      numDecksCreated,
      onCreateDeckFromSet,
      onDeleteSet,
      onEditSet,
      user
    } = this.props;
    const { isCardListExpanded, isPermalinkCopied } = this.state;
    const canEditSet = this.doesSetBelongToUser && !metadata.isPublished;

    return (
      <Paper className={classes.paper}>
        <div>
          <strong>{name}</strong> by {metadata.authorName}
        </div>
        <div className={classes.controls}>
          <MustBeLoggedIn loggedIn={!!user}>
            {this.renderButton('Create Deck', onCreateDeckFromSet, { disabled: cards.length < 15 })}
            {canEditSet ? this.renderButton('Publish', this.handleOpenPublishConfirmation, { disabled: cards.length < 15 }) : null}
            {canEditSet ? this.renderButton('Edit', onEditSet) : null}
            {this.doesSetBelongToUser ? this.renderButton('Delete', onDeleteSet, { color: 'secondary' }) : null}
          </MustBeLoggedIn>
        </div>
        <div>
        {description}
        </div>
        <div>
          <a className={classes.bottomLink} onClick={this.toggleCardList}>
            [{isCardListExpanded ? 'hide' : 'show'} {cards.length} cards]
          </a>
          {' '}
          <CopyToClipboard text={this.permalinkUrl} onCopy={this.afterCopyPermalink}>
            <a className={classes.bottomLink}>[{isPermalinkCopied ? 'copied' : 'copy permalink'}]</a>
          </CopyToClipboard>
        </div>
        {isCardListExpanded && <div>
          {cards.map((card, idx) => <SetSummaryCard card={card} key={idx} waitMs={25 * idx} />)}
          <div style={{clear: 'both'}}></div>
        </div>}
        <div className={classes.numDecksCreated}>
          {!isUndefined(numDecksCreated) ? numDecksCreated : '?'} decks created
        </div>
        {this.renderConfirmPublishDialog()}
      </Paper>
    );
  }

  private renderConfirmPublishDialog = () => {
    const { set, classes, onPublishSet } = this.props;
    const { isPublishConfirmDialogOpen } = this.state;

    return (
      <Dialog
        open={isPublishConfirmDialogOpen}
        onClose={this.closePublishConfirmDialogue}
      >
        <DialogContent>
          <p>Are you sure that you want to publish the <b>{set.name}</b> set?</p>
          <p>Once a set is published, it can no longer be edited (only deleted), and it will be visible by all players.</p>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="outlined"
            className={classes.dialogButton}
            onClick={onPublishSet}
          >
            Publish
          </Button>
          <Button
            color="primary"
            variant="outlined"
            className={classes.dialogButton}
            onClick={this.closePublishConfirmDialogue}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  private renderButton = (text: string, action: () => void, additionalProps?: ButtonProps): JSX.Element => (
    <Button
      variant="outlined"
      size="small"
      color="primary"
      classes={{ outlined: this.props.classes.controlsButton }}
      onClick={action}
      {...additionalProps}
    >
      {text}
    </Button>
  )

  private afterCopyPermalink = () => {
    this.setState({ isPermalinkCopied: true });
  }

  private toggleCardList = () => {
    this.setState((state) => ({
      isCardListExpanded: !state.isCardListExpanded
    }));
  }

  private handleOpenPublishConfirmation = () => {
    this.setState({ isPublishConfirmDialogOpen: true });
  }

  private closePublishConfirmDialogue = () => {
    this.setState({ isPublishConfirmDialogOpen: false });
  }
}

export default withStyles(SetSummary.styles)(SetSummary);
