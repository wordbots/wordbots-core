import { History } from 'history';
import { range, uniqBy } from 'lodash';
import * as React from 'react';
import Carousel, { ResponsiveObject } from 'react-slick';

import { builtinCardNames } from '../../store/cards';
import * as w from '../../types';
import { listenToRecentCards } from '../../util/firebase';
import Card from '../card/Card';

interface RecentCardsCarouselProps {
  history: History
  userId?: string
  username?: string
}

interface RecentCardsCarouselState {
  recentCards: w.CardInStore[]
}

export default class RecentCardsCarousel extends React.Component<RecentCardsCarouselProps, RecentCardsCarouselState> {
  public static MAX_CARDS_TO_SHOW = 8;

  public state = {
    recentCards: []
  };

  get carouselBreakpoints(): ResponsiveObject[] {
    const BASE_WIDTH_BREAKPOINT = 950;
    const BASE_SLIDES_TO_SHOW = 3;
    const CARD_WIDTH = 200;

    return range(3, RecentCardsCarousel.MAX_CARDS_TO_SHOW + 1).map((slidesToShow) => ({
      breakpoint: BASE_WIDTH_BREAKPOINT + (slidesToShow - BASE_SLIDES_TO_SHOW) * CARD_WIDTH,
      settings: { slidesToShow }
    }));
  }

  public componentDidMount(): void {
    const { userId } = this.props;

    listenToRecentCards((data) => {
      let recentCards = uniqBy(Object.values(data as w.CardInStore[]), 'name')
                            .filter((card) => card.text && !builtinCardNames.includes(card.name))
                            .reverse()
                            .slice(0, 10);

      if (recentCards.length < RecentCardsCarousel.MAX_CARDS_TO_SHOW && recentCards.length > 0) {
        // eslint-disable-next-line no-loops/no-loops
        while (recentCards.length < RecentCardsCarousel.MAX_CARDS_TO_SHOW) {
          recentCards = [...recentCards, ...recentCards];
        }
      }

      this.setState({ recentCards });
    }, userId);
  }

  public render(): JSX.Element | null {
    if (this.state.recentCards.length > 0) {
      return (
        <div>
          <Carousel
            dots
            infinite
            autoplay
            pauseOnHover
            arrows={false}
            draggable={false}
            speed={500}
            autoplaySpeed={1500}
            slidesToScroll={1}
            responsive={[
              ...this.carouselBreakpoints,
              {breakpoint: 100000, settings: {slidesToShow: RecentCardsCarousel.MAX_CARDS_TO_SHOW}}
            ]}
          >
            {
              this.state.recentCards.map((card, idx) =>
                <div
                  key={idx}
                  onClick={this.handleClickCard(card)}
                  style={{
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  {Card.fromObj(card)}
                </div>
              )
            }
          </Carousel>
          <p
            style={{
              marginTop: 30,
              color: '#999',
              fontSize: 20,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              textAlign: 'center'
            }}
          >
            Most recently created cards
          </p>
        </div>
      );
    } else {
      return null;
    }
  }

  private handleClickCard = (card: w.CardInStore) => () => {
    const { userId, username } = this.props;
    // Provide a source field if it's missing on the card.
    const cardWithSource: w.CardInStore = {
      ...card,
      source: card.source && card.source !== 'user' ? card.source : (userId && username ? { uid: userId, username } : undefined)
    };

    this.props.history.push(`/card/${card.id}`, { card: cardWithSource });
  }
}
