import Button from '@material-ui/core/Button';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import TextField from '@material-ui/core/TextField';
import { capitalize, debounce, isEqual, sortBy } from 'lodash';
import * as React from 'react';

import { BLUE_PLAYER_COLOR, BLUE_PLAYER_COLOR_DARKENED, ORANGE_PLAYER_COLOR, ORANGE_PLAYER_COLOR_DARKENED } from '../../constants';
import * as w from '../../types';
import CardTooltip from '../card/CardTooltip';
import Tooltip from '../Tooltip';

import CardSelectorCard from './CardSelectorCard';

interface CardSelectorBaseProps {
  onaddCardToHand: (player: string, card: w.CardInStore) => void
  cardCollection: w.CardInStore[]
}

interface CardSelectorState {
  selectedCard?: w.CardInStore
  searchText: string
  cardCollection: w.CardInStore[]
}

type CardSelectorProps = CardSelectorBaseProps & WithStyles;

class CardSelector extends React.Component<CardSelectorProps, CardSelectorState> {
  public static styles: Record<string, CSSProperties> = {
    container: {
      height: '100%',
      width: 256
    },
    searchBar: {
      height: 48,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center'
    },
    searchBarInner: {
      width: 232
    },
    cardsContainer: {
      height: 'calc(100% - 64px - 48px)',
      overflowY: 'scroll',
      width: '100%'
    },
    buttonsContainer: {
      height: 64,
      display: 'flex',
      width: '100%'
    },
    buttonRoot: {
      width: 128,
      height: 64,
      borderRadius: 0
    },
    buttonBlue: {
      backgroundColor: BLUE_PLAYER_COLOR,
      '&:hover': {
        backgroundColor: BLUE_PLAYER_COLOR_DARKENED
      }
    },
    buttonOrange: {
      backgroundColor: ORANGE_PLAYER_COLOR,
      '&:hover': {
        backgroundColor: ORANGE_PLAYER_COLOR_DARKENED
      }
    }
  };

  private filterCardCollection = debounce((searchText: string): void => {
    const { cardCollection } = this.props;
    const filteredCollection = cardCollection.filter((card: w.CardInStore): boolean =>
      card.name.toLowerCase().includes(searchText.toLowerCase())
    );

    this.setState(({ selectedCard }) => ({
      cardCollection: filteredCollection,
      // Unselect currently selected card if it's no longer visible
      selectedCard: (selectedCard && filteredCollection.map((c) => c.id).includes(selectedCard.id)) ? selectedCard : undefined
    }));
  }, 300);

  constructor(props: CardSelectorProps) {
    super(props);

    this.state = {
      selectedCard: undefined,
      searchText: '',
      cardCollection: props.cardCollection
    };
  }

  public render(): JSX.Element {
    const { classes } = this.props;
    const { searchText } = this.state;

    return (
      <div className={classes.container}>
        <TextField
          className={classes.searchBar}
          InputProps={{ classes: { root: classes.searchBarInner }}}
          placeholder="Search cards..."
          value={searchText}
          onChange={this.handleSearchTextChange}
        />
        <div className={classes.cardsContainer}>{this.cardsList}</div>
        <div className={classes.buttonsContainer}>
          {this.renderAddCardToDeckButton('orange')}
          {this.renderAddCardToDeckButton('blue')}
        </div>
      </div>
    );
  }

  private handleSearchTextChange = (event: React.SyntheticEvent<any>): void => {
    this.setState({ searchText: event.currentTarget.value });
    this.filterCardCollection(event.currentTarget.value);
  }

  private handleSelectCard = (card: w.CardInStore): void => {
    this.setState((state) => ({
      selectedCard: card === state.selectedCard ? undefined : card
    }));
  }

  private handleGiveCard = (player: string): () => void => (): void => {
    const { selectedCard } = this.state;
    if (selectedCard) {
      this.props.onaddCardToHand(player, selectedCard);
      this.setState({ selectedCard: undefined });
    }
  }

  private get cardsList(): JSX.Element[] {
    const { cardCollection, selectedCard } = this.state;

    return sortBy(cardCollection, 'cost').map((card: w.CardInStore, index: number): JSX.Element => (
      <CardTooltip card={card} key={index}>
        <CardSelectorCard
          card={card}
          isSelected={!!selectedCard && isEqual(card, selectedCard)}
          onCardSelect={this.handleSelectCard}
        />
      </CardTooltip>
    ));
  }

  private renderAddCardToDeckButton(player: string): JSX.Element {
    const { classes } = this.props;

    return (
      <Tooltip text={`Place card in the ${player} player's hand.`} place="left">
        <Button
          variant="contained"
          color="primary"
          classes={{
            root: classes.buttonRoot,
            containedPrimary: classes[`button${capitalize(player)}`]
          }}
          onClick={this.handleGiveCard(player)}
          disabled={!this.state.selectedCard}
        >
          Give to<br />{player}
        </Button>
      </Tooltip>
    );
  }
}

export default withStyles(CardSelector.styles)(CardSelector);
