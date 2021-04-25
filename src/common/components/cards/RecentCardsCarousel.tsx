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
}

interface RecentCardsCarouselState {
  recentCards: w.CardInStore[]
  paused: boolean
  width?: number
}

export default class RecentCardsCarousel extends React.Component<RecentCardsCarouselProps, RecentCardsCarouselState> {
  public static MAX_CARDS_TO_SHOW = 8;

  public state: RecentCardsCarouselState = {
    recentCards: [],
    paused: false
  };

  public constructor(props: RecentCardsCarouselProps) {
    super(props);
    this.initializeCarousel(props.userId);
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
    const { recentCards, paused, width } = this.state;

    if (recentCards.length > 0) {
      return (
        <div>
          <div
            style={{
              marginTop: 10,
              color: '#999',
              fontSize: 20,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              textAlign: 'center'
            }}
          >
            Most recently created cards
          </div>
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
                    <CardProvenanceDescription card={card} style={{ position: 'relative', top: 22, fontSize: 11, color: '#888', maxWidth: 155 }} />
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
    let recentCards = await mostRecentCards(userId || null, 15);

    if (recentCards.length < RecentCardsCarousel.MAX_CARDS_TO_SHOW && recentCards.length > 0) {
      while (recentCards.length < RecentCardsCarousel.MAX_CARDS_TO_SHOW) {
        recentCards = [...recentCards, ...recentCards];
      }
    }

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
