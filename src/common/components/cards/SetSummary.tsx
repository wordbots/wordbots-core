import * as React from 'react';
import { Paper, withStyles, WithStyles } from '@material-ui/core';

import * as w from '../../../common/types';
import Card from '../card/Card';

interface SetSummaryProps {
  set: w.Set
}

interface SetSummaryState {
  isCardListExpanded: boolean
}

class SetSummary extends React.Component<SetSummaryProps & WithStyles, SetSummaryState> {
  public static styles = {
    toggleCardListLink: {
      cursor: 'pointer',
      textDecoration: 'underline'
    }
  };

  public state = {
    isCardListExpanded: false
  };

  public render(): JSX.Element {
    const { classes, set: { cards, description, metadata, name }} = this.props;
    const { isCardListExpanded } = this.state;

    return (
      <Paper style={{ padding: 10, marginBottom: 5 }}>
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
