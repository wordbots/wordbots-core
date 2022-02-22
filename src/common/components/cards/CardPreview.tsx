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
  flavorText?: string
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
          <div
            style={{
              border: '2px solid white',
              padding: '0 15px',
              borderRadius: 30,
              background: 'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1) 10px, rgba(128, 128, 128, 0.1) 10px, rgba(128, 128, 128, 0.1) 20px)'
            }}
          >
            <div
              style={{
                position: 'relative',
                top: -15,
                width: '100%',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  fontFamily: '"Space Age"',
                  backgroundColor: 'rgb(0, 188, 212)',
                  display: 'inline',
                  padding: '2px 12px',
                  fontSize: '1.5em',
                  color: 'white',
                  borderRadius: 30,
                  textTransform: 'uppercase',
                }}
              >
                Preview
              </div>
            </div>

            <Card
              visible
              name={name || '[Unnamed]'}
              spriteID={spriteID}
              spriteV={SPRITE_VERSION}
              type={type}
              cost={energy}
              stats={this.stats}
              cardStats={this.stats}
              flavorText={this.props.flavorText}
              text={this.props.sentences.map((s, i) => <Sentence key={i} text={s.sentence} result={s.result} />)}
              rawText={this.props.sentences.map((s) => s.sentence).join('. ')}
              source={{ type: 'user' }}
              showSpinner={sentences.some((s) => !s.result.js && !s.result.error)}
              scale={2.5}
              onSpriteClick={onSpriteClick}
              overrideContainerStyles={{ padding: 0 }}
            />
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}
