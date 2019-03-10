import * as React from 'react';
import { compose } from 'redux';
import { History } from 'history';
import * as CopyToClipboard from 'react-copy-to-clipboard';
import { Paper, withStyles, WithStyles, Button } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import * as fb from 'firebase';

import * as w from '../../types';
import RouterDialog from '../RouterDialog';
import Card from '../card/Card';

interface SetSummaryBaseProps {
  set: w.Set
  user: fb.User | null
  onCreateDeckFromSet: () => void
  onDeleteSet: () => void
  onEditSet: () => void
  onPublishSet: () => void
  history: History
}

interface SetSummaryState {
  isCardListExpanded: boolean,
  isPermalinkCopied: boolean
}

type SetSummaryProps = SetSummaryBaseProps & WithStyles;

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
    isPermalinkCopied: false
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
      onCreateDeckFromSet,
      onDeleteSet,
      onEditSet
    } = this.props;
    const { isCardListExpanded, isPermalinkCopied } = this.state;

    return (
      <Paper className={classes.paper}>
        <div>
          <strong>{name}</strong> by {metadata.authorName}
        </div>
        <div className={classes.controls}>
          {this.renderButton('Create Deck', onCreateDeckFromSet, { disabled: cards.length < 15 })}
          {
            (this.doesSetBelongToUser && !metadata.isPublished) && <span>
              {this.renderButton('Publish', this.handleOpenPublishConfirmation, { disabled: cards.length < 15 })}
              {this.renderButton('Edit', onEditSet)}
            </span>
          }
          {this.doesSetBelongToUser && this.renderButton('Delete', onDeleteSet, { color: 'secondary' })}
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
        {isCardListExpanded && (
          <div>
            {cards.map((card, idx) => <div key={idx} style={{float: 'left'}}>
              {Card.fromObj(card, { scale: 0.7 })}
            </div>)}
            <div style={{clear: 'both'}}></div>
          </div>
        )}
        <div className={classes.numDecksCreated}>
          {metadata.numDecksCreated || 0} decks created
        </div>
        {this.renderConfirmPublishDialog()}
      </Paper>
    );
  }

  private renderConfirmPublishDialog = () => {
    const { set, history, classes } = this.props;

    const actions: JSX.Element[] = [
      <Button
        key="publish"
        color="primary"
        variant="outlined"
        className={classes.dialogButton}
        onClick={this.handlePublishSet}
      >
        Publish
      </Button>,
      <Button
        key="cancel"
        color="primary"
        variant="outlined"
        className={classes.dialogButton}
        onClick={this.closeDialogs}
      >
        Cancel
      </Button>
    ];

    return (
      <RouterDialog
        path={`publish-${set.id}`}
        title="Are you sure?"
        history={history}
        actions={actions}
        style={{width: 400, position: 'relative'}}
      >
        <p>Are you sure you want to publish the <b>{set.name}</b> set?</p>
        <p>Once a set is published, it can no longer be edited (only deleted), and it will be visible by all players.</p>
      </RouterDialog>
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
    const { set, history } = this.props;
    RouterDialog.openDialog(history, `publish-${set.id}`);
  }

  private handlePublishSet = () => {
    this.props.onPublishSet();
    this.closeDialogs();
  }

  private closeDialogs = () => {
    RouterDialog.closeDialog(this.props.history);
  }
}

export default compose(
  withStyles(SetSummary.styles)
)(SetSummary);
