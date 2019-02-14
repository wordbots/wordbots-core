import * as React from 'react';
import { Paper, withStyles, WithStyles, Button } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import * as fb from 'firebase';

import * as w from '../../types';
import Card from '../card/Card';

interface SetSummaryProps {
  set: w.Set
  user: fb.User | null
  onDeleteSet: () => void
  onEditSet: () => void
}

interface SetSummaryState {
  isCardListExpanded: boolean
}

class SetSummary extends React.Component<SetSummaryProps & WithStyles, SetSummaryState> {
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
      padding: 4
    },
    toggleCardListLink: {
      cursor: 'pointer',
      textDecoration: 'underline'
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
    isCardListExpanded: false
  };

  get doesSetBelongToUser(): boolean {
    const { set, user } = this.props;
    return user ? set.metadata.authorId === user.uid : false;
  }

  public render(): JSX.Element {
    const {
      classes,
      set: { cards, description, metadata, name },
      onDeleteSet,
      onEditSet
    } = this.props;
    const { isCardListExpanded } = this.state;

    return (
      <Paper className={classes.paper}>
        <div>
          <strong>{name}</strong> by {metadata.authorName}
        </div>
        <div className={classes.controls}>
          {
            (this.doesSetBelongToUser && !metadata.isPublished) && <span>
              {this.renderButton('Edit', onEditSet)}
              {this.renderButton('Delete', onDeleteSet, { color: 'secondary' })}
            </span>
          }
        </div>
        <div>
        {description}
        </div>
        <div>
          <a className={classes.toggleCardListLink} onClick={this.toggleCardList}>
            [{isCardListExpanded ? 'Hide' : 'Show'} {cards.length} cards]
          </a>
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
      </Paper>
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

  private toggleCardList = () => {
    this.setState((state) => ({
      isCardListExpanded: !state.isCardListExpanded
    }));
  }
}

export default withStyles(SetSummary.styles)(SetSummary);
