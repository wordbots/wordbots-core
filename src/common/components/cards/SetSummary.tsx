import * as React from 'react';
import { Paper, withStyles, WithStyles } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

import * as w from '../../../common/types';
import Card from '../card/Card';

interface SetSummaryProps {
  set: w.Set
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

  public render(): JSX.Element {
    const { classes, set: { cards, description, metadata, name }} = this.props;
    const { isCardListExpanded } = this.state;

    return (
      <Paper className={classes.paper}>
        <div>
          <strong>{name}</strong> by {metadata.authorName}
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
            {cards.map((card) => <div style={{float: 'left'}}>
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

  private toggleCardList = () => {
    this.setState((state) => ({
      isCardListExpanded: !state.isCardListExpanded
    }));
  }
}

export default withStyles(SetSummary.styles)(SetSummary);
