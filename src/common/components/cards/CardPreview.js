import * as React from 'react';
import { arrayOf, func, number, object, string } from 'prop-types';

import { SPRITE_VERSION } from '../../constants.ts';
import { inBrowser } from '../../util/browser.tsx';
import Card from '../card/Card.tsx';
import Sentence from '../card/Sentence.tsx';

export default class CardPreview extends React.Component {
  static propTypes = {
    name: string,
    spriteID: string,
    type: number,
    sentences: arrayOf(object),
    attack: number,
    speed: number,
    health: number,
    energy: number,

    onSpriteClick: func
  };

  get stats() {
    return {
      attack: this.props.attack,
      speed: this.props.speed,
      health: this.props.health
    };
  }

  render() {
    if (inBrowser()) {
      return (
        <div style={{
          width: '40%',
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 64,
          paddingLeft: 20,
          paddingTop: 40
        }}>
          <Card
            name={this.props.name || '[Unnamed]'}
            spriteID={this.props.spriteID}
            spriteV={SPRITE_VERSION}
            type={this.props.type}
            cost={this.props.energy}
            stats={this.stats}
            cardStats={this.stats}
            text={this.props.sentences.map(s => Sentence(s.sentence, s.result))}
            rawText={this.props.sentences.map(s => s.sentence).join('. ')}
            parseResults={JSON.stringify(this.props.sentences.map(s => s.result))}
            scale={3}
            onSpriteClick={this.props.onSpriteClick} />
        </div>
      );
    } else {
      return null;
    }
  }
}
