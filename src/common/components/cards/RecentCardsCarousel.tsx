import { History } from 'history';
import { chain as _, range } from 'lodash';
import * as React from 'react';
import Carousel, { ResponsiveObject } from 'react-slick';

import * as w from '../../types';
import { listenToCards } from '../../util/firebase';
import Card from '../card/Card';

import CardProvenanceDescription from './CardProvenanceDescription';

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

    // TODO cancel this subscription in componentWillUnmount(), to fix:
    //   backend.js:1 Warning: Can't perform a React state update on an unmounted component.
    //   This is a no-op, but it indicates a memory leak in your application.
    (this as any).listener = listenToCards((data) => {
      let recentCards: w.CardInStore[] = _(Object.values(data) as w.CardInStore[])
        .uniqBy('name')
        .filter((c: w.CardInStore) =>  // Filter out all of the following from carousels:
          !!c.text  // cards without text (uninteresting)
            && !!c.metadata.updated  // cards without timestamp (can't order them)
            && c.metadata.source.type === 'user'  // built-in cards
            && !c.metadata.isPrivate  // private cards
            && !c.metadata.duplicatedFrom  // duplicated cards
            && !c.metadata.importedFromJson  // cards imported from JSON
        )
        .orderBy((c: w.CardInStore) => c.metadata.updated, ['desc'])
        .slice(0, 10)
        .value();

      if (recentCards.length < RecentCardsCarousel.MAX_CARDS_TO_SHOW && recentCards.length > 0) {
        // eslint-disable-next-line no-loops/no-loops
        while (recentCards.length < RecentCardsCarousel.MAX_CARDS_TO_SHOW) {
          recentCards = [...recentCards, ...recentCards];
        }
      }

      this.setState({ recentCards });
    }, userId || null);
  }

  public componentWillUnmount(): void {
    (this as any).listener.off();
  }

  public render(): JSX.Element | null {
    const { userId } = this.props;
    const { recentCards } = this.state;

    if (recentCards.length > 0) {
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
              recentCards.map((card, idx) =>
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  {Card.fromObj(card, { onCardClick: () => { this.handleClickCard(card); }})}
                  {!userId && <CardProvenanceDescription card={card} style={{ fontSize: 11, color: '#888', maxWidth: 155 }} />}
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

  private handleClickCard = (card: w.CardInStore) => {
    this.props.history.push(`/card/${card.id}`, { card });
  }
}
