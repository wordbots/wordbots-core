import { History } from 'history';
import { range } from 'lodash';
import * as React from 'react';
import Measure, { ContentRect } from 'react-measure';
import Carousel, { ResponsiveObject } from 'react-slick';

import * as w from '../../types';
import { mostRecentCards } from '../../util/firebase';
import { Card } from '../card/Card';
import ConveyorBelt from '../ConveyorBelt';

import CardProvenanceDescription from './CardProvenanceDescription';

interface RecentCardsCarouselProps {
  history: History
  userId?: string
  numCards?: number  // defaults to 15
  cardsToShow?: w.CardInStore[]  // if set, override the carousel's lookup behavior
}

interface RecentCardsCarouselState {
  recentCards: w.CardInStore[]
  paused: boolean
  width?: number
}

const duplicateCardsUntilCarouselFull = (cards: w.CardInStore[]): w.CardInStore[] => {
  if (cards.length < RecentCardsCarousel.MAX_CARDS_TO_SHOW && cards.length > 0) {
    while (cards.length < RecentCardsCarousel.MAX_CARDS_TO_SHOW) {
      cards = [...cards, ...cards];
    }
  }
  return cards;
};

export default class RecentCardsCarousel extends React.Component<RecentCardsCarouselProps, RecentCardsCarouselState> {
  public static MAX_CARDS_TO_SHOW = 8;

  public state: RecentCardsCarouselState = {
    recentCards: [],
    paused: false
  };

  public constructor(props: RecentCardsCarouselProps) {
    super(props);
    if (!props.cardsToShow) {
      this.initializeCarousel(props.userId);
    }
  }

  get carouselBreakpoints(): ResponsiveObject[] {
    const BASE_WIDTH_BREAKPOINT = 950;
    const BASE_SLIDES_TO_SHOW = 3;
    const CARD_WIDTH = 200;

    return range(3, RecentCardsCarousel.MAX_CARDS_TO_SHOW + 1).map((slidesToShow) => ({
      breakpoint: BASE_WIDTH_BREAKPOINT + (slidesToShow - BASE_SLIDES_TO_SHOW) * CARD_WIDTH,
      settings: { slidesToShow }
    }));
  }

  public render(): JSX.Element {
    return (
      <Measure offset onResize={this.handleResize}>
        {({ measureRef }) => (
          <div ref={measureRef}>
            {this.renderInner()}
          </div>
        )}
      </Measure>
    );
  }

  private renderInner(): JSX.Element | null {
    const { cardsToShow } = this.props;
    const { recentCards, paused, width } = this.state;

    const cards = cardsToShow || recentCards;

    if (cards.length > 0) {
      return (
        <div>
          <div
            className="recentCardsCarousel"
            onMouseOver={this.handleMouseOver}
            onMouseLeave={this.handleMouseLeave}
          >
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
                { breakpoint: 100000, settings: { slidesToShow: RecentCardsCarousel.MAX_CARDS_TO_SHOW } }
              ]}
            >
              {
                duplicateCardsUntilCarouselFull(cards).map((card, idx) =>
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    {Card.fromObj(card, { onCardClick: () => { this.handleClickCard(card); } })}
                    <CardProvenanceDescription
                      card={card}
                      style={{
                        position: 'relative',
                        top: 20,
                        fontSize: 10.5,
                        color: '#888',
                        maxWidth: 140,
                        padding: '1px 3px',
                        background: `rgba(255, 255, 255, 0.8)`,
                        borderRadius: 5
                      }}
                    />
                  </div>
                )
              }
            </Carousel>
          </div>
          <div style={{ position: 'relative', top: -53 }}>
            <ConveyorBelt
              width={width || 0}
              paused={paused}
            />
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  private initializeCarousel = async (userId?: string) => {
    const { numCards } = this.props;
    const recentCards = (await mostRecentCards(userId || null, numCards || 15)).filter((c) => !!c.text); // filter out cards without text (uninteresting)
    this.setState({ recentCards });
  }

  private handleClickCard = (card: w.CardInStore) => {
    this.props.history.push(`/card/${card.id}`, { card });
  }

  private handleMouseOver = () => { this.setState({ paused: true }); }
  private handleMouseLeave = () => { this.setState({ paused: false }); }

  private handleResize = (contentRect: ContentRect) => {
    this.setState({ width: contentRect.offset?.width });
  }
}
