import { Button, Dialog, DialogActions, DialogContent, IconButton, Paper } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import * as fb from 'firebase';
import { History } from 'history';
import { isUndefined } from 'lodash';
import * as React from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';

import * as w from '../../types';
import { SetDraftFormat } from '../../util/formats';
import { Card } from '../card/Card';
import Tooltip from '../Tooltip';
import MustBeLoggedIn from '../users/MustBeLoggedIn';
import ProfileLink from '../users/ProfileLink';

import { sortCards } from './utils';
import { SortCriteria } from './types.enums';

interface SetSummaryBaseProps {
  set: w.Set
  user: fb.User | null
  history: History
  inPublishedSetsList?: boolean
  isSingleSet?: boolean
  numDecksCreated?: number
  onCreateDeckFromSet: () => void
  onDeleteSet: () => void
  onDuplicateSet: () => void
  onEditSet: () => void
  onPublishSet: () => void
}

interface SetSummaryState {
  isCardListExpanded: boolean
  isDeleteConfirmationOpen: boolean
  isPermalinkCopied: boolean
  isPublishConfirmDialogOpen: boolean
}

type SetSummaryProps = SetSummaryBaseProps & WithStyles;

class SetSummary extends React.Component<SetSummaryProps, SetSummaryState> {
  public static styles: Record<string, CSSProperties> = {
    paper: {
      display: 'inline-block',
      position: 'relative',
      padding: 10,
      margin: '5px 15px',
      textAlign: 'left',
      maxWidth: '95%',
      transition: 'width 250ms ease-in-out'
    },
    confirmDeleteControl: {
      fontSize: '13px',
      paddingLeft: 5,
      paddingRight: 2
    },
    confirmDeleteLabel: {
      color: 'red',
      marginRight: 3
    },
    titleAndControls: {
      display: 'flex',
      justifyContent: 'space-between'
    },
    controls: {
      flex: '0 0 auto'
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
    description: {
      margin: '5px 100px 0 48px',
      color: '#333',
      fontSize: '0.9em'
    },
    link: {
      fontSize: '0.9em',
      color: '#666',
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
    isCardListExpanded: !!this.props.isSingleSet,
    isDeleteConfirmationOpen: false,
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
      inPublishedSetsList,
      onCreateDeckFromSet,
      onDuplicateSet,
      onEditSet,
      user
    } = this.props;
    const { isCardListExpanded, isPermalinkCopied } = this.state;
    const canEditSet = this.doesSetBelongToUser && !metadata.isPublished;

    return (
      <div>
        <Paper className={classes.paper} style={{ width: isCardListExpanded ? '95%' : 850 }}>
          <IconButton style={{ float: 'left' }} onClick={this.toggleCardList}>
            {isCardListExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          <div className={classes.titleAndControls}>
            <div>
              <strong><a className="underline" href={this.permalinkUrl}>{name}</a></strong> by <ProfileLink uid={metadata.authorId} username={metadata.authorName} />
              {!inPublishedSetsList && metadata.isPublished && <i> (published)</i>}
              <a className={classes.link} style={{ marginLeft: 10 }} onClick={this.toggleCardList}>
                [{isCardListExpanded ? 'hide' : 'show'}&nbsp;{cards.length}&nbsp;cards]
            </a>
              {' '}
              <CopyToClipboard text={this.permalinkUrl} onCopy={this.afterCopyPermalink}>
                <a className={classes.link}>[{isPermalinkCopied ? 'copied' : <span>copy&nbsp;permalink</span>}]</a>
              </CopyToClipboard>
            </div>
            <div className={classes.controls}>
              <MustBeLoggedIn
                loggedIn={!!user}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%'
                }}
              >
                {this.renderButton('Draft!', this.handleDraftFromSet, { disabled: cards.length < 15, reason: "You can't draft this set because it has less than 15 cards." }, { style: { fontWeight: 'bold' } })}
                {this.renderButton('Create Deck', onCreateDeckFromSet, { disabled: cards.length < 15, reason: "You can't create a deck from this set because it has less than 15 cards." })}
                {canEditSet ? this.renderButton('Publish', this.handleOpenPublishConfirmation, { disabled: cards.length < 15, reason: "You can't publish this set because it has less than 15 cards." }) : null}
                {canEditSet ? this.renderButton('Edit', onEditSet) : null}
                {this.doesSetBelongToUser ? this.renderButton('Duplicate', onDuplicateSet) : null}
                {this.renderDeleteControl()}
              </MustBeLoggedIn>
            </div>
          </div>
          <div>
            <div className={classes.description}>
              {description}
            </div>
            {isCardListExpanded &&
              <div>
                <div style={{ clear: 'both' }} />
                {
                  cards
                    .sort((c1, c2) => sortCards(c1, c2, SortCriteria.Cost))
                    .map((card, idx) => (
                      <div key={idx} style={{ float: 'left' }}>
                        {Card.fromObj(card, { scale: 0.7, onCardClick: () => { this.handleClickCard(card); } })}
                      </div>
                    ))
                }
                <div style={{ clear: 'both' }} />
              </div>
            }
          </div>
          <div className={classes.numDecksCreated}>
            {!isUndefined(numDecksCreated) ? numDecksCreated : '?'} decks created
          </div>
          {this.renderConfirmPublishDialog()}
        </Paper>
      </div>
    );
  }

  private renderConfirmPublishDialog = () => {
    const { set, classes } = this.props;
    const { isPublishConfirmDialogOpen } = this.state;

    return (
      <Dialog
        open={isPublishConfirmDialogOpen}
        onClose={this.handleClosePublishConfirmation}
      >
        <DialogContent>
          <p>Are you sure that you want to publish the <b>{set.name}</b> set?</p>
          <p>Once a set is published, it can no longer be edited (only deleted), and it will be visible by all players.</p>
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            variant="outlined"
            className={classes.dialogButton}
            onClick={this.handlePublishSet}
          >
            Publish
          </Button>
          <Button
            color="secondary"
            variant="outlined"
            className={classes.dialogButton}
            onClick={this.handleClosePublishConfirmation}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  private renderDeleteControl = (): JSX.Element | null => {
    const { classes } = this.props;
    const { isDeleteConfirmationOpen } = this.state;

    if (this.doesSetBelongToUser) {
      if (isDeleteConfirmationOpen) {
        return (
          <span className={classes.confirmDeleteControl}>
            <span className={classes.confirmDeleteLabel}>delete?</span>
            <a className={classes.link} onClick={this.handleDeleteSet}>yes</a>/<a className={classes.link} onClick={this.handleCloseDeleteConfirmation}>no</a>
          </span>
        );
      } else {
        return this.renderButton('Delete', this.handleOpenDeleteConfirmation, undefined, { color: 'primary' });
      }
    } else {
      return null;
    }
  }

  private renderButton = (text: string, action: () => void, disabled?: { disabled: boolean, reason: string }, additionalProps?: ButtonProps): JSX.Element => (
    <Tooltip inline disable={!(disabled?.disabled)} text={disabled?.reason || ''}>
      <Button
        variant="outlined"
        size="small"
        color="secondary"
        classes={{ outlined: this.props.classes.controlsButton }}
        onClick={action}
        disabled={disabled?.disabled}
        {...additionalProps}
      >
        {text}
      </Button>
    </Tooltip>
  )

  private handleClickCard = (card: w.CardInStore) => {
    this.props.history.push(`/card/${card.id}`, { card });
  }

  private afterCopyPermalink = () => {
    this.setState({ isPermalinkCopied: true });
  }

  private toggleCardList = () => {
    this.setState((state) => ({
      isCardListExpanded: !state.isCardListExpanded
    }));
  }

  private handleDeleteSet = () => {
    this.handleCloseDeleteConfirmation();
    this.props.onDeleteSet();
  }

  private handlePublishSet = () => {
    this.handleClosePublishConfirmation();
    this.props.onPublishSet();
  }

  private handleDraftFromSet = () => {
    const { set, history } = this.props;
    history.push(`/play//host?format=${(new SetDraftFormat(set)).name}`);
  }

  private handleOpenDeleteConfirmation = () => { this.setState({ isDeleteConfirmationOpen: true }); };
  private handleCloseDeleteConfirmation = () => { this.setState({ isDeleteConfirmationOpen: false }); };

  private handleOpenPublishConfirmation = () => { this.setState({ isPublishConfirmDialogOpen: true }); };
  private handleClosePublishConfirmation = () => { this.setState({ isPublishConfirmDialogOpen: false }); };
}

export default withStyles(SetSummary.styles)(SetSummary);
