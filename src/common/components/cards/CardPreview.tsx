import * as React from 'react';

import { SPRITE_VERSION } from '../../constants';
import * as w from '../../types';
import { inBrowser } from '../../util/browser';
import Card from '../card/Card';
import Sentence from '../card/Sentence';

interface CardPreviewProps {
  name: string
  spriteID: string
  type: w.CardType
  sentences: w.Sentence[]
  attack: number
  speed: number
  health: number
  energy: number

  onSpriteClick: () => void
}

export default class CardPreview extends React.Component<CardPreviewProps> {
  get stats(): Record<w.Attribute, number> {
    return {
      attack: this.props.attack,
      speed: this.props.speed,
      health: this.props.health
    };
  }

  public render(): JSX.Element | null {
    const { name, spriteID, type, energy, sentences, onSpriteClick } = this.props;

    if (inBrowser()) {
      return (
        <div
          style={{
            width: '40%',
            display: 'flex',
            justifyContent: 'center',
            paddingRight: 32
          }}
        >
          <Card
            visible
            name={name || '[Unnamed]'}
            spriteID={spriteID}
            spriteV={SPRITE_VERSION}
            type={type}
            cost={energy}
            stats={this.stats}
            cardStats={this.stats}
            text={sentences.map((s, i) => <Sentence key={i} text={s.sentence} result={s.result} />)}
            rawText={sentences.map((s) => s.sentence).join('. ')}
            source={{ type: 'user' }}
            parseResults={JSON.stringify(sentences.map((s) => s.result))}
            showSpinner={sentences.some((s) => !s.result.js && !s.result.error)}
            scale={2.5}
            onSpriteClick={onSpriteClick}
          />
        </div>
      );
    } else {
      return null;
    }
  }
}
