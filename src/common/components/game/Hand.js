import React, { Component } from 'react';
import { array, bool, func, number, object, string } from 'prop-types';
import ReactDOM from 'react-dom';
import { CSSTransitionGroup } from 'react-transition-group';
import { isEmpty, isNull } from 'lodash';

import { splitSentences } from '../../util/cards';
import { getCost } from '../../util/game';
import Card from '../card/Card';
import Sentence from '../card/Sentence';
import TutorialTooltip from '../game/TutorialTooltip';

export default class Hand extends Component {
  static propTypes = {
    name: string,
    cards: array,
    isActivePlayer: bool,
    selectedCard: number,
    hoveredCard: number,
    targetableCards: array,
    status: object,
    curved: bool,
    opponent: bool,
    tutorialStep: object,

    onSelectCard: func,
    onHoverCard: func,
    onTutorialStep: func
  };

  constructor() {
    super();
    this.availableWidth = 500;
  }

  componentDidMount() {
    this.calculateAvailableWidth();
  }

  componentWillUpdate() {
    this.calculateAvailableWidth();
  }

  calculateAvailableWidth() {
    // The only way to accurately get the width of the hand seems to be through ReactDOM.findDOMNode().
    /* eslint-disable react/no-find-dom-node */
    if (ReactDOM.findDOMNode(this)) {
      this.availableWidth = ReactDOM.findDOMNode(this).offsetWidth;
    }
    /* eslint-enable react/no-find-dom-node */
  }

  renderCards() {
    const widthPerCard = 151;
    const defaultMargin = 24;
    const maxWidth = this.availableWidth - 20;
    const numCards = this.props.cards.length;
    const baseWidth = numCards * widthPerCard;
    const cardMargin = maxWidth ? Math.min((maxWidth - baseWidth) / (numCards - 1), defaultMargin) : defaultMargin;
    const adjustedWidth = numCards * (widthPerCard + cardMargin) - cardMargin;

    return this.props.cards.map((card, idx) => {
      const zIndex = isNull(this.props.hoveredCard) ? 0 : (1000 - Math.abs(this.props.hoveredCard - idx) * 10);

      // TODO this isn't quite right ...
      const rotationDegs = (idx - (numCards - 1)/2) * 5;
      const translationPx = Math.sin(Math.abs(rotationDegs) * Math.PI / 180) * adjustedWidth / 5;

      return (
        <TutorialTooltip
          key={card.id}
          tutorialStep={this.props.tutorialStep}
          enabled={this.props.tutorialStep && this.props.tutorialStep.tooltip.card === card.name}
          onNextStep={() => { this.props.onTutorialStep(); }}
          onPrevStep={() => { this.props.onTutorialStep(true); }}
        >
          <Card
            key={card.id}
            numCards={numCards}
            status={this.props.status}
            name={card.name}
            spriteID={card.spriteID}
            spriteV={card.spriteV}
            type={card.type}
            text={splitSentences(card.text).map(Sentence)}
            rawText={card.text || ''}
            img={card.img}
            cost={getCost(card)}
            baseCost={card.baseCost}
            cardStats={card.stats}
            source={card.source}

            selected={this.props.selectedCard === idx && (isEmpty(this.props.targetableCards) || !this.props.isActivePlayer)}
            targetable={this.props.isActivePlayer && this.props.targetableCards.includes(card.id)}
            visible={this.props.isActivePlayer}

            margin={idx < numCards - 1 ? cardMargin : 0}
            rotation={this.props.curved ? rotationDegs : 0}
            yTranslation={this.props.curved ? translationPx : 0}
            zIndex={zIndex}

            onCardClick={e => { this.props.onSelectCard(idx); }}
            onCardHover={overOrOut => { this.props.onHoverCard(overOrOut ? idx : null); }} />
        </TutorialTooltip>
      );
    });
  }

  render() {
    return (
      <CSSTransitionGroup
        id={this.props.opponent ? 'handTop' : 'handBottom'}
        transitionName="hand"
        transitionEnterTimeout={500}
        transitionLeave={false}
        className={isNull(this.props.selectedCard) ? '' : 'selected'}
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: 'calc(100% - 400px)',
          position: 'absolute',
          left: 0,
          right: 0,
          margin: '0 auto'
        }}>
        {this.renderCards()}
      </CSSTransitionGroup>
    );
  }
}
