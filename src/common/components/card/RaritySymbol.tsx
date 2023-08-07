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
      fontFamily: '"DejaVu Sans", sans-serif',
      fontSize: 17 * (scale || 1),
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
