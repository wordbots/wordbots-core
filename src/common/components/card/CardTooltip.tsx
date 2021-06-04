import * as React from 'react';
import * as ReactTooltip from 'react-tooltip';

import { MAX_Z_INDEX } from '../../constants';
import * as w from '../../types';
import { createSafePortal } from '../../util/browser';
import { id, withTrailingPeriod } from '../../util/common';
import Popover from '../Popover';

import { Card } from './Card';
import Sentence from './Sentence';

interface CardTooltipProps {
  children: JSX.Element | JSX.Element[]
  card: w.CardInStore
  stats?: {
    attack?: number
    health: number
    speed?: number
  }
  abilities?: w.PassiveAbility[]
  triggers?: w.TriggeredAbility[]
  popover?: boolean
  isOpen?: boolean
}

export default class CardTooltip extends React.Component<CardTooltipProps> {
  private tooltipId = id();

  public render(): JSX.Element | JSX.Element[] {
    const { children, card, stats, abilities, triggers, popover, isOpen } = this.props;

    if (!card) {
      return children;
    } else if (popover) {
      // Append text from abilities and triggers that have been added to the object
      // (that is, abilities and triggers that are on the object but aren't on the original card).
      // TODO unit-test this functionality because it's a little finicky!
      const cardText: string = withTrailingPeriod((card.text as string));
      const additionalText: string = (
        [...abilities || [], ...triggers || []]
          .filter((a) => a.source && a.text)
          .map((a) => withTrailingPeriod(a.text))
          .join('\n')
      );
      const medialNewline: string = (cardText && additionalText) ? '\n' : '';
      const sentences: JSX.Element[] = Sentence.fromTextChunks([
        { text: cardText },
        { text: `${medialNewline}${additionalText}`, color: 'green' }
      ]);

      return (
        <Popover
          isOpen={isOpen}
          body={Card.fromObj(card, {
            stats: stats || card.stats,
            text: sentences
          })}
          style={{ zIndex: MAX_Z_INDEX }}
          preferPlace="above"
          showTip={false}
        >
          {children}
        </Popover>
      );
    } else {
      return (
        <span>
          <span data-tip="" data-for={this.tooltipId}>
            {children}
          </span>
          {
            createSafePortal(
              <ReactTooltip
                id={this.tooltipId}
                className="hovered-card"
                place="top"
                style={{ zIndex: MAX_Z_INDEX }}
              >
                {Card.fromObj(card)}
              </ReactTooltip>,
              document.querySelector('#modal-root')!
            )
          }
        </span>
      );
    }
  }
}
