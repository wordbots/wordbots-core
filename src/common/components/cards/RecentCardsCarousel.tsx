import { History } from 'history';
import { chain as _, range } from 'lodash';
import * as React from 'react';
import Carousel, { ResponsiveObject } from 'react-slick';

import * as w from '../../types';
import { getCards } from '../../util/firebase';
import Card from '../card/Card';

import CardProvenanceDescription from './CardProvenanceDescription';

interface RecentCardsCarouselProps {
  history: History
  userId?: string
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

  public async componentDidMount(): Promise<void> {
    const { userId } = this.props;

    const cards = await getCards(userId || null);
    let recentCards: w.CardInStore[] = _(cards)
      .uniqBy('name')
      .filter((c: w.CardInStore) =>  // Filter out all of the following from carousels:
        !!c.text  // cards without text (uninteresting)
          && !!c.metadata.updated  // cards without timestamp (can't order them)
          && c.metadata.source.type === 'user'  // built-in cards
          && !c.metadata.isPrivate  // private cards
          && !c.metadata.duplicatedFrom  // duplicated cards
          && !c.metadata.importedFromJson  // cards imported from JSON
          && (c.metadata.source.uid === c.metadata.ownerId)  // cards imported from other players' collections
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
  }

  public render(): JSX.Element | null {
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
                  <CardProvenanceDescription card={card} style={{ fontSize: 11, color: '#888', maxWidth: 155 }} />
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
