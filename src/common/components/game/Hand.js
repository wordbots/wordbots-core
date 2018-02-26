import React, { Component } from 'react';
import { arrayOf, bool, func, number, object } from 'prop-types';
import ReactDOM from 'react-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { isEmpty, isNull } from 'lodash';

import CardInHand from './CardInHand';

export default class Hand extends Component {
  static propTypes = {
    cards: arrayOf(object),
    isActivePlayer: bool,
    selectedCard: number,
    targetableCards: arrayOf(object),
    status: object,
    curved: bool,
    opponent: bool,
    sandbox: bool,
    tutorialStep: object,

    onSelectCard: func,
    onTutorialStep: func
  };

  state = {
    availableWidth: 500,
    hoveredCardIdx: null
  };

  componentDidMount() {
    this.calculateAvailableWidth();
  }

  componentWillReceiveProps() {
    this.calculateAvailableWidth();
  }

  calculateAvailableWidth() {
    // The only way to accurately get the width of the hand seems to be through ReactDOM.findDOMNode().
    /* eslint-disable react/no-find-dom-node */
    if (ReactDOM.findDOMNode(this)) {
      this.setState({availableWidth: ReactDOM.findDOMNode(this).offsetWidth});
    }
    /* eslint-enable react/no-find-dom-node */
  }

  handleHoverCard = (hoveredCardIdx) => { this.setState({ hoveredCardIdx }); }

  renderCards() {
    const {
      cards, isActivePlayer, targetableCards, status, curved, opponent, sandbox, selectedCard, tutorialStep,
      onSelectCard, onTutorialStep
    } = this.props;
    const { availableWidth, hoveredCardIdx } = this.state;

    const widthPerCard = 151;
    const defaultMargin = 24;

    const isUpsideDown = sandbox && opponent;
    const maxWidth = availableWidth - 20;
    const numCards = cards.length;
    const baseWidth = numCards * widthPerCard;
    const cardMargin = maxWidth ? Math.min((maxWidth - baseWidth) / (numCards - 1), defaultMargin) : defaultMargin;
    const adjustedWidth = numCards * (widthPerCard + cardMargin) - cardMargin;

    return cards.map((card, idx) => {
      // TODO this isn't quite right ...
      const rotationDegs = (idx - (numCards - 1)/2) * 5;
      const translationPx = Math.sin(Math.abs(rotationDegs) * Math.PI / 180) * adjustedWidth / 5;

      return (
        <CSSTransition key={card.id} classNames="hand" exit={false} timeout={500}>
          <CardInHand
            card={card}
            idx={idx}
            margin={idx < numCards - 1 ? cardMargin : 0}
            rotation={isUpsideDown ? 180 : (curved ? rotationDegs : 0)}
            selected={selectedCard === idx && (isEmpty(targetableCards) || !isActivePlayer)}
            status={status}
            targetable={isActivePlayer && targetableCards.includes(card.id)}
            tutorialStep={tutorialStep}
            visible={isActivePlayer || sandbox}
            yTranslation={curved ? translationPx : 0}
            zIndex={isNull(hoveredCardIdx) ? 0 : (1000 - Math.abs(hoveredCardIdx - idx) * 10)}
            onSelectCard={onSelectCard}
            onHoverCard={this.handleHoverCard}
            onTutorialStep={onTutorialStep} />
       </CSSTransition>
      );
    });
  }

  render() {
    return (
      <TransitionGroup
        id={this.props.opponent ? 'handTop' : 'handBottom'}
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
      </TransitionGroup>
    );
  }
}
