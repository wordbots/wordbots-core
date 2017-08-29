import React, {Component} from 'react';
import {object} from 'prop-types';
import {CSSTransition, TransitionGroup} from 'react-transition-group';

import {splitSentences} from '../../util/cards';

import Card from './Card';
import Sentence from './Sentence';

export default class CardViewer extends Component {
  static propTypes = {
    hoveredCard: object
  };

  renderCard() {
    if (this.props.hoveredCard) {
      return (
        <CSSTransition classNames="card-viewer-fade" timeout={100}>
          <Card
            scale={1.5}
            stats={this.props.hoveredCard.stats}
            name={this.props.hoveredCard.card.name}
            type={this.props.hoveredCard.card.type}
            spriteID={this.props.hoveredCard.card.spriteID}
            spriteV={this.props.hoveredCard.card.spriteV}
            text={splitSentences(this.props.hoveredCard.card.text).map(s =>
              Sentence(s, {parsed: true})
            )}
            rawText={this.props.hoveredCard.card.text}
            img={this.props.hoveredCard.card.img}
            cost={this.props.hoveredCard.card.cost}
            cardStats={this.props.hoveredCard.card.stats}
            source={this.props.hoveredCard.card.source}
          />
        </CSSTransition>
      );
    } else {
      return null;
    }
  }

  render() {
    return (
      <div
        style={{
          position: 'absolute',
          left: 10,
          top: 0,
          bottom: 0,
          margin: 'auto',
          height: 236 * 1.5
        }}
      >
        <TransitionGroup>{this.renderCard()}</TransitionGroup>
      </div>
    );
  }
}
