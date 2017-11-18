import React, { Component } from 'react';
import { bool, func, number, object } from 'prop-types';

import { splitSentences } from '../../util/cards';
import { getCost } from '../../util/game';
import Card from '../card/Card';
import Sentence from '../card/Sentence';
import TutorialTooltip from '../game/TutorialTooltip';

export default class CardInHand extends Component {
  static propTypes = {
    card: object,
    idx: number,
    margin: number,
    rotation: number,
    selected: bool,
    status: object,
    targetable: bool,
    tutorialStep: object,
    visible: bool,
    yTranslation: number,
    zIndex: number,
    onSelectCard: func,
    onHoverCard: func,
    onTutorialStep: func
  };

  handleClickCard = () => { this.props.onSelectCard(this.props.idx); };
  handleHoverCard = (overOrOut) => { this.props.onHoverCard(overOrOut ? this.props.idx : null); };
  handleClickNextStep = () => { this.props.onTutorialStep(); };
  handleClickPrevStep = () => { this.props.onTutorialStep(true); };

  render() {
    const {
      card, tutorialStep,
      status, selected, targetable, visible, margin, rotation, yTranslation, zIndex
    } = this.props;
    const { baseCost, img, name, source, stats, text, type, spriteID, spriteV } = card;

    return (
      <TutorialTooltip
        tutorialStep={tutorialStep}
        enabled={tutorialStep && tutorialStep.tooltip.card === name}
        onNextStep={this.handleClickNextStep}
        onPrevStep={this.handleClickPrevStep}
      >
        <div>
          <Card
            {...{ baseCost, img, name, source, spriteID, spriteV, type }}

            text={splitSentences(text).map(Sentence)}
            rawText={text || ''}
            cost={getCost(card)}
            cardStats={stats}

            {...{ status, selected, targetable, visible, margin, rotation, yTranslation, zIndex }}

            onCardClick={this.handleClickCard}
            onCardHover={this.handleHoverCard} />
        </div>
      </TutorialTooltip>
    );
  }
}
