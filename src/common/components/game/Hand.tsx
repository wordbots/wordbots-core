import { isEmpty, isNull } from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { HAND_Z_INDEX } from '../../constants';
import * as w from '../../types';

import CardInHand from './CardInHand';

interface HandProps {
  cards: w.PossiblyObfuscatedCard[]
  selectedCard: number
  targetableCards: w.CardId[]
  status: w.PlayerStatus
  isCurrentPlayer: boolean
  isActivePlayer: boolean
  curved?: boolean
  opponent?: boolean
  sandbox?: boolean
  tutorialStep?: w.TutorialStep
  onSelectCard: (cardIdx: number) => void
  onTutorialStep: (back?: boolean) => void
}

interface HandState {
  availableWidth: number
  hoveredCardIdx: number | null
}

export default class Hand extends React.Component<HandProps, HandState> {
  public state = {
    availableWidth: 500,
    hoveredCardIdx: null
  };

  public componentDidMount(): void {
    this.calculateAvailableWidth();
  }

  public UNSAFE_componentWillReceiveProps(): void {
    this.calculateAvailableWidth();
  }

  public render(): JSX.Element {
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
          margin: '0 auto',
          zIndex: HAND_Z_INDEX
        }}
      >
        {this.renderCards()}
      </TransitionGroup>
    );
  }

  private calculateAvailableWidth(): void {
    // The only way to accurately get the width of the hand seems to be through ReactDOM.findDOMNode().
    // eslint-disable-next-line react/no-find-dom-node
    const node: HTMLElement | null = ReactDOM.findDOMNode(this) as HTMLElement | null;
    if (node) {
      this.setState({ availableWidth: node.offsetWidth });
    }
  }

  private handleHoverCard = (hoveredCardIdx: number | null) => { this.setState({ hoveredCardIdx }); };

  private renderCards(): JSX.Element[] {
    const {
      cards, isActivePlayer, isCurrentPlayer, targetableCards, status, curved, opponent, sandbox, selectedCard, tutorialStep,
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
      const rotationDegs = (idx - (numCards - 1) / 2) * 5;
      const translationPx = Math.sin(Math.abs(rotationDegs) * Math.PI / 180) * adjustedWidth / 5;

      return (
        <CSSTransition
          key={card.id === 'obfuscated' ? `obfuscated-${idx}` : card.id}
          classNames="hand"
          exit={false}
          timeout={500}
        >
          <CardInHand
            card={card}
            idx={idx}
            margin={idx < numCards - 1 ? cardMargin : 0}
            rotation={isUpsideDown ? 180 : (curved ? rotationDegs : 0)}
            selected={selectedCard === idx && (!sandbox || isCurrentPlayer) && (isEmpty(targetableCards) || !isActivePlayer)}
            status={status}
            targetable={isActivePlayer && targetableCards.includes(card.id)}
            tutorialStep={tutorialStep}
            visible={!!isActivePlayer || !!sandbox}
            yTranslation={curved ? translationPx : 0}
            zIndex={isNull(hoveredCardIdx) ? 0 : (1000 - Math.abs(hoveredCardIdx! - idx) * 10)}
            onSelectCard={onSelectCard}
            onHoverCard={this.handleHoverCard}
            onTutorialStep={onTutorialStep}
          />
        </CSSTransition>
      );
    });
  }
}
