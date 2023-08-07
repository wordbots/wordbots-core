import { capitalize } from 'lodash';
import * as React from 'react';

import * as w from '../../types';
import Tooltip from '../Tooltip';

interface RaritySymbolProps {
  rarity: w.CardInSetRarity
  scale?: number
  isEditing?: boolean
}

export default function RaritySymbol({ rarity, scale, isEditing }: RaritySymbolProps): JSX.Element {
  return (
    <span style={{
      display: 'inline-block',
      userSelect: 'none',
      // DejaVu Sans is one of few fonts that includes all 3 characters we need and scales them fairly similarly.
      // Having all three characters within one font solves most of our previous issues with having to scale different characters differently.
      // It's packaged by default with most Linux distros, and we serve DejaVuSans.ttf for other OSs.
      fontFamily: '"DejaVu Sans", sans-serif',
      fontSize: (rarity === 'rare' ? 19 : 17) * (scale || 1),
      marginTop: 5 * (scale || 1),
      marginLeft: -1 * (scale || 1),
      color: ({ rare: '#d4af37', uncommon: '#aaa9ad', common: undefined })[rarity]
    }}>
      <Tooltip
        key={rarity}
        text={`${capitalize(rarity)}${isEditing ? ' (click to change)' : ''}`}
        place="left"
        className="card-part-tooltip"
      >
        {
          ({
            'common': '●',
            'uncommon': '◆',
            'rare': '★'
          })[rarity]
        }
      </Tooltip>
    </span>
  );
}
