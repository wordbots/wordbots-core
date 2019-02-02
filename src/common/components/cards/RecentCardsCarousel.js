import * as React from 'react';
import { func, object, string } from 'prop-types';
import Carousel from 'react-slick';
import { uniqBy, range } from 'lodash';

import { listenToRecentCards } from '../../util/firebase.ts';
import { builtinCardNames } from '../../store/cards.ts';
import Card from '../card/Card.tsx';

export default class RecentCardsCarousel extends React.Component {
  static propTypes = {
    history: object,
    onOpenForEditing: func,
    userId: string
  }

  MAX_CARDS_TO_SHOW = 8;

  state = {
    recentCards: []
  };

  componentDidMount() {
    const { userId } = this.props;

    listenToRecentCards(data => {
      let recentCards = uniqBy(Object.values(data), 'name')
                            .filter(card => !builtinCardNames.includes(card.name))
                            .reverse()
                            .slice(0, 10);

      if (recentCards.length < this.MAX_CARDS_TO_SHOW && recentCards.length > 0) {
        // eslint-disable-next-line no-loops/no-loops
        while (recentCards.length < this.MAX_CARDS_TO_SHOW) {
          recentCards = [...recentCards, ...recentCards];
        }
      }

      this.setState({ recentCards });
    }, userId);
  }

  onClickCard = card => () => {
    this.props.onOpenForEditing(card);
    this.props.history.push('/creator');
  }

  get carouselBreakpoints() {
    const BASE_WIDTH_BREAKPOINT = 950;
    const BASE_SLIDES_TO_SHOW = 3;
    const CARD_WIDTH = 200;

    return range(3, this.MAX_CARDS_TO_SHOW + 1).map((slidesToShow) => ({
      breakpoint: BASE_WIDTH_BREAKPOINT + (slidesToShow - BASE_SLIDES_TO_SHOW) * CARD_WIDTH,
      settings: { slidesToShow }
    }));
  }

  render() {
    if (this.state.recentCards.length > 0) {
      return (
        <div>
          <Carousel dots infinite autoplay pauseOnHover
            arrows={false}
            draggable={false}
            speed={500}
            autoplaySpeed={1500}
            slidesToScroll={1}
            responsive={[
              ...this.carouselBreakpoints,
              {breakpoint: 100000, settings: {slidesToShow: this.MAX_CARDS_TO_SHOW}}
            ]}
          >
            {
              this.state.recentCards.map((card, idx) =>
                <div
                  key={idx}
                  onClick={this.onClickCard(card)}
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
          <p style={{
            marginTop: 30,
            color: '#999',
            fontSize: 20,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            textAlign: 'center'
          }}>
            Most recently created cards
          </p>
        </div>
      );
    } else {
      return null;
    }
  }
}
