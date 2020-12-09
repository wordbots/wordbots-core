import * as React from 'react';

import { isCardVisible } from '../../guards';
import * as w from '../../types';
import { getCost } from '../../util/game';
import Card from '../card/Card';
import CardBack from '../card/CardBack';
import Sentence from '../card/Sentence';

import TutorialTooltip from './TutorialTooltip';

interface CardInHandProps {
  card: w.PossiblyObfuscatedCard
  idx: number
  margin: number
  rotation: number
  selected: boolean
  status: w.PlayerStatus
  targetable?: boolean
  tutorialStep?: w.TutorialStep
  visible: boolean
  yTranslation: number
  zIndex: number
  onSelectCard: (cardIdx: number) => void
  onHoverCard: (cardIdx: number | null) => void
  onTutorialStep: (back?: boolean) => void
}

export default class CardInHand extends React.Component<CardInHandProps> {
  public render(): JSX.Element {
    const {
      card, tutorialStep,
      status, selected, targetable, visible, margin, rotation, yTranslation, zIndex
    } = this.props;
    if (isCardVisible(card)) {
      const { baseCost, id, img, name, metadata, stats, text, type, spriteID, spriteV } = card;

      return (
        <TutorialTooltip
          tutorialStep={tutorialStep}
          enabled={tutorialStep?.tooltip?.card === name}
          onNextStep={this.handleClickNextStep}
          onPrevStep={this.handleClickPrevStep}
        >
          <div>
            <Card
              {...{ id, baseCost, img, name, spriteID, spriteV, type }}

              text={Sentence.fromText(text)}
              rawText={text || ''}
              cost={getCost(card)}
              stats={stats || {}}
              cardStats={stats || {}}
              source={metadata.source}

              {...{ status, selected, targetable, visible, margin, rotation, yTranslation, zIndex }}

              onCardClick={this.handleClickCard}
              onCardHover={this.handleHoverCard}
            />
          </div>
        </TutorialTooltip>
      );
    } else {
      return <CardBack />;
    }
  }

  private handleClickCard = () => { this.props.onSelectCard(this.props.idx); };
  private handleHoverCard = (isMouseOver: boolean ) => { this.props.onHoverCard(isMouseOver ? this.props.idx : null); };
  private handleClickNextStep = () => { this.props.onTutorialStep(); };
  private handleClickPrevStep = () => { this.props.onTutorialStep(true); };
}
